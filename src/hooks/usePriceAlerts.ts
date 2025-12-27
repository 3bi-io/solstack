import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useOptimizedSolPrice } from '@/hooks/useOptimizedSolPrice';
import { notificationService } from '@/lib/notifications';

interface PriceAlert {
  id: string;
  user_id: string;
  token_symbol: string;
  target_price: number;
  condition: 'above' | 'below';
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { solPrice } = useOptimizedSolPrice();
  const lastPriceRef = useRef<number | null>(null);
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  // Fetch user alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as PriceAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  // Create a new alert
  const createAlert = async (
    targetPrice: number,
    condition: 'above' | 'below',
    tokenSymbol: string = 'SOL'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in to create alerts", variant: "destructive" });
        return false;
      }

      const { error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          token_symbol: tokenSymbol,
          target_price: targetPrice,
          condition,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Alert Created",
        description: `You'll be notified when ${tokenSymbol} goes ${condition} $${targetPrice.toFixed(2)}`,
      });

      await fetchAlerts();
      return true;
    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast({ title: "Failed to create alert", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an alert
  const deleteAlert = async (alertId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(a => a.id !== alertId));
      triggeredAlertsRef.current.delete(alertId);
      toast({ title: "Alert deleted" });
      return true;
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast({ title: "Failed to delete alert", variant: "destructive" });
      return false;
    }
  };

  // Toggle alert active state
  const toggleAlert = async (alertId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive, triggered_at: null })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_active: isActive, triggered_at: null } : a
      ));
      
      if (isActive) {
        triggeredAlertsRef.current.delete(alertId);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error toggling alert:', error);
      return false;
    }
  };

  // Check alerts against current price
  useEffect(() => {
    if (!solPrice || solPrice === lastPriceRef.current) return;
    
    const currentPrice = solPrice;
    const previousPrice = lastPriceRef.current;
    lastPriceRef.current = currentPrice;

    // Skip first price update
    if (previousPrice === null) return;

    // Check each active alert
    alerts.forEach(async (alert) => {
      if (!alert.is_active) return;
      if (alert.token_symbol !== 'SOL') return;
      if (triggeredAlertsRef.current.has(alert.id)) return;

      const targetPrice = Number(alert.target_price);
      let shouldTrigger = false;

      if (alert.condition === 'above') {
        // Trigger when price crosses above target
        if (previousPrice < targetPrice && currentPrice >= targetPrice) {
          shouldTrigger = true;
        }
      } else if (alert.condition === 'below') {
        // Trigger when price crosses below target
        if (previousPrice > targetPrice && currentPrice <= targetPrice) {
          shouldTrigger = true;
        }
      }

      if (shouldTrigger) {
        triggeredAlertsRef.current.add(alert.id);
        
        // Show notification toast
        toast({
          title: `🔔 Price Alert Triggered!`,
          description: `SOL is now ${alert.condition} $${targetPrice.toFixed(2)} (Current: $${currentPrice.toFixed(2)})`,
          duration: 10000,
        });

        // Send push notification
        await notificationService.showPriceAlert('SOL', alert.condition, targetPrice, currentPrice);

        // Play notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVMjPIXO5erVsW1CIDT+');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}

        // Mark as triggered in database
        await supabase
          .from('price_alerts')
          .update({ 
            triggered_at: new Date().toISOString(),
            is_active: false 
          })
          .eq('id', alert.id);

        // Update local state
        setAlerts(prev => prev.map(a => 
          a.id === alert.id 
            ? { ...a, triggered_at: new Date().toISOString(), is_active: false }
            : a
        ));
      }
    });
  }, [solPrice, alerts]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchAlerts();
    });

    return () => subscription.unsubscribe();
  }, [fetchAlerts]);

  const activeAlerts = alerts.filter(a => a.is_active);
  const triggeredAlerts = alerts.filter(a => !a.is_active && a.triggered_at);

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    isLoading,
    createAlert,
    deleteAlert,
    toggleAlert,
    refreshAlerts: fetchAlerts,
    currentPrice: solPrice,
  };
};