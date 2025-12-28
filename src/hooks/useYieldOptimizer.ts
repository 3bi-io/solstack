import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OptimizerSettings {
  id: string;
  is_enabled: boolean;
  min_apy_difference: number;
  max_gas_cost: number;
  check_interval_hours: number;
  risk_tolerance: 'low' | 'medium' | 'high';
  last_optimization_at: string | null;
}

interface OptimizationHistory {
  id: string;
  from_farm_id: string;
  from_farm_name: string;
  to_farm_id: string;
  to_farm_name: string;
  amount: number;
  token: string;
  old_apy: number;
  new_apy: number;
  apy_gain: number;
  status: string;
  transaction_signature: string | null;
  created_at: string;
}

interface Farm {
  id: string;
  name: string;
  token: string;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  lockPeriod: number;
}

interface FarmPosition {
  farm_id: string;
  farm_name: string;
  token: string;
  staked_amount: number;
  lock_end_at: string | null;
}

interface OptimizationSuggestion {
  fromFarm: Farm;
  toFarm: Farm;
  position: FarmPosition;
  apyGain: number;
  estimatedYearlyGain: number;
}

const DEFAULT_SETTINGS: Omit<OptimizerSettings, 'id'> = {
  is_enabled: false,
  min_apy_difference: 5.0,
  max_gas_cost: 0.01,
  check_interval_hours: 24,
  risk_tolerance: 'medium',
  last_optimization_at: null,
};

export const useYieldOptimizer = (farms: Farm[], positions: FarmPosition[]) => {
  const [settings, setSettings] = useState<OptimizerSettings | null>(null);
  const [history, setHistory] = useState<OptimizationHistory[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { connected, publicKey } = useWallet();

  // Fetch optimizer settings
  const fetchSettings = useCallback(async () => {
    if (!publicKey) return;

    try {
      const { data, error } = await supabase
        .from('yield_optimizer_settings')
        .select('*')
        .eq('wallet_address', publicKey.toBase58())
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data as OptimizerSettings);
      }
    } catch (error) {
      console.error('Error fetching optimizer settings:', error);
    }
  }, [publicKey]);

  // Fetch optimization history
  const fetchHistory = useCallback(async () => {
    if (!publicKey) return;

    try {
      const { data, error } = await supabase
        .from('yield_optimization_history')
        .select('*')
        .eq('wallet_address', publicKey.toBase58())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory((data || []) as OptimizationHistory[]);
    } catch (error) {
      console.error('Error fetching optimization history:', error);
    }
  }, [publicKey]);

  // Calculate optimization suggestions
  const calculateSuggestions = useCallback(() => {
    if (!settings || positions.length === 0 || farms.length === 0) {
      setSuggestions([]);
      return;
    }

    const riskOrder = { low: 0, medium: 1, high: 2 };
    const maxRisk = riskOrder[settings.risk_tolerance];

    const newSuggestions: OptimizationSuggestion[] = [];

    positions.forEach(position => {
      // Skip locked positions
      if (position.lock_end_at && new Date(position.lock_end_at) > new Date()) {
        return;
      }

      const currentFarm = farms.find(f => f.id === position.farm_id);
      if (!currentFarm) return;

      // Find better farms with same token and acceptable risk
      const betterFarms = farms.filter(farm => {
        if (farm.id === currentFarm.id) return false;
        if (farm.token !== currentFarm.token) return false;
        if (riskOrder[farm.riskLevel] > maxRisk) return false;
        
        const apyDifference = farm.apy - currentFarm.apy;
        return apyDifference >= settings.min_apy_difference;
      });

      // Get the best alternative
      const bestFarm = betterFarms.sort((a, b) => b.apy - a.apy)[0];
      
      if (bestFarm) {
        const apyGain = bestFarm.apy - currentFarm.apy;
        const estimatedYearlyGain = (Number(position.staked_amount) * apyGain) / 100;

        newSuggestions.push({
          fromFarm: currentFarm,
          toFarm: bestFarm,
          position,
          apyGain,
          estimatedYearlyGain,
        });
      }
    });

    // Sort by potential gain
    newSuggestions.sort((a, b) => b.estimatedYearlyGain - a.estimatedYearlyGain);
    setSuggestions(newSuggestions);
  }, [settings, positions, farms]);

  // Update settings
  const updateSettings = async (newSettings: Partial<OptimizerSettings>): Promise<boolean> => {
    if (!publicKey) {
      toast({ title: "Please connect your wallet", variant: "destructive" });
      return false;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return false;
      }

      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('yield_optimizer_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('yield_optimizer_settings')
          .insert({
            user_id: user.id,
            wallet_address: publicKey.toBase58(),
            ...DEFAULT_SETTINGS,
            ...newSettings,
          });

        if (error) throw error;
      }

      await fetchSettings();
      toast({ title: "Settings Updated", description: "Yield optimizer settings saved" });
      return true;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({ title: "Failed to update settings", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute optimization (move funds from one farm to another)
  const executeOptimization = async (
    suggestion: OptimizationSuggestion,
    withdrawFn: (farmId: string, farmName: string, token: string, amount: number) => Promise<boolean>,
    stakeFn: (farmId: string, farmName: string, token: string, amount: number, lockDays: number) => Promise<boolean>
  ): Promise<boolean> => {
    if (!publicKey) {
      toast({ title: "Please connect your wallet", variant: "destructive" });
      return false;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return false;
      }

      const amount = Number(suggestion.position.staked_amount);

      toast({ 
        title: "Optimizing Yield", 
        description: `Moving ${amount} ${suggestion.position.token} from ${suggestion.fromFarm.name} to ${suggestion.toFarm.name}` 
      });

      // Record the optimization attempt
      const { data: historyRecord, error: insertError } = await supabase
        .from('yield_optimization_history')
        .insert({
          user_id: user.id,
          from_farm_id: suggestion.fromFarm.id,
          from_farm_name: suggestion.fromFarm.name,
          to_farm_id: suggestion.toFarm.id,
          to_farm_name: suggestion.toFarm.name,
          amount_moved: amount,
          amount,
          token: suggestion.position.token,
          from_apy: suggestion.fromFarm.apy,
          to_apy: suggestion.toFarm.apy,
          old_apy: suggestion.fromFarm.apy,
          new_apy: suggestion.toFarm.apy,
          apy_gain: suggestion.apyGain,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Step 1: Withdraw from current farm
      const withdrawSuccess = await withdrawFn(
        suggestion.fromFarm.id,
        suggestion.fromFarm.name,
        suggestion.position.token,
        amount
      );

      if (!withdrawSuccess) {
        await supabase
          .from('yield_optimization_history')
          .update({ status: 'failed' })
          .eq('id', historyRecord.id);
        throw new Error('Withdrawal failed');
      }

      // Step 2: Stake in new farm
      const stakeSuccess = await stakeFn(
        suggestion.toFarm.id,
        suggestion.toFarm.name,
        suggestion.position.token,
        amount,
        suggestion.toFarm.lockPeriod
      );

      if (!stakeSuccess) {
        await supabase
          .from('yield_optimization_history')
          .update({ status: 'partial' })
          .eq('id', historyRecord.id);
        throw new Error('Stake failed - funds withdrawn but not restaked');
      }

      // Update history record
      await supabase
        .from('yield_optimization_history')
        .update({ 
          status: 'completed',
          transaction_signature: `opt_${Date.now()}_${Math.random().toString(36).substring(7)}`
        })
        .eq('id', historyRecord.id);

      // Update last optimization time
      if (settings) {
        await supabase
          .from('yield_optimizer_settings')
          .update({ last_optimization_at: new Date().toISOString() })
          .eq('id', settings.id);
      }

      toast({
        title: "Optimization Complete!",
        description: `Moved to ${suggestion.toFarm.name} for +${suggestion.apyGain.toFixed(1)}% APY`,
      });

      await fetchHistory();
      return true;
    } catch (error: any) {
      console.error('Optimization error:', error);
      toast({ title: "Optimization Failed", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchSettings();
      fetchHistory();
    }
  }, [connected, publicKey, fetchSettings, fetchHistory]);

  // Recalculate suggestions when dependencies change
  useEffect(() => {
    calculateSuggestions();
  }, [calculateSuggestions]);

  return {
    settings,
    history,
    suggestions,
    isLoading,
    updateSettings,
    executeOptimization,
    refreshSuggestions: calculateSuggestions,
  };
};
