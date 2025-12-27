import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TokenAllocation {
  id?: string;
  token_symbol: string;
  token_mint?: string;
  target_percentage: number;
  current_percentage: number;
  current_value_usd: number;
  deviation_threshold: number;
  is_active: boolean;
}

interface RebalanceTrade {
  token_symbol: string;
  action: 'buy' | 'sell';
  amount_usd: number;
  percentage_change: number;
}

interface RebalanceHistory {
  id: string;
  rebalance_type: string;
  trades_executed: number;
  total_value_usd: number;
  status: string;
  details: any;
  created_at: string;
}

interface PortfolioAsset {
  symbol: string;
  mint?: string;
  balance: number;
  valueUsd: number;
}

export const usePortfolioRebalancer = (portfolioAssets: PortfolioAsset[], totalValueUsd: number) => {
  const [allocations, setAllocations] = useState<TokenAllocation[]>([]);
  const [history, setHistory] = useState<RebalanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { connected, publicKey } = useWallet();

  // Fetch saved allocations
  const fetchAllocations = useCallback(async () => {
    if (!publicKey) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_allocations')
        .select('*')
        .eq('wallet_address', publicKey.toBase58());

      if (error) throw error;

      // Merge with current portfolio
      const merged: TokenAllocation[] = portfolioAssets.map(asset => {
        const saved = data?.find(a => a.token_symbol === asset.symbol);
        const currentPct = totalValueUsd > 0 ? (asset.valueUsd / totalValueUsd) * 100 : 0;
        
        return {
          id: saved?.id,
          token_symbol: asset.symbol,
          token_mint: asset.mint,
          target_percentage: saved?.target_percentage || 0,
          current_percentage: currentPct,
          current_value_usd: asset.valueUsd,
          deviation_threshold: saved?.deviation_threshold || 5,
          is_active: saved?.is_active ?? true,
        };
      });

      setAllocations(merged);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  }, [publicKey, portfolioAssets, totalValueUsd]);

  // Fetch rebalancing history
  const fetchHistory = useCallback(async () => {
    if (!publicKey) return;

    try {
      const { data, error } = await supabase
        .from('rebalancing_history')
        .select('*')
        .eq('wallet_address', publicKey.toBase58())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory((data || []) as RebalanceHistory[]);
    } catch (error) {
      console.error('Error fetching rebalancing history:', error);
    }
  }, [publicKey]);

  // Calculate required trades to rebalance
  const requiredTrades = useMemo((): RebalanceTrade[] => {
    if (totalValueUsd <= 0) return [];

    const activeAllocations = allocations.filter(a => a.is_active && a.target_percentage > 0);
    const totalTargetPct = activeAllocations.reduce((sum, a) => sum + a.target_percentage, 0);
    
    if (totalTargetPct === 0) return [];

    const trades: RebalanceTrade[] = [];

    activeAllocations.forEach(allocation => {
      const deviation = allocation.current_percentage - allocation.target_percentage;
      
      if (Math.abs(deviation) >= allocation.deviation_threshold) {
        const targetValue = (allocation.target_percentage / 100) * totalValueUsd;
        const amountChange = targetValue - allocation.current_value_usd;
        
        trades.push({
          token_symbol: allocation.token_symbol,
          action: amountChange > 0 ? 'buy' : 'sell',
          amount_usd: Math.abs(amountChange),
          percentage_change: deviation,
        });
      }
    });

    return trades.sort((a, b) => b.amount_usd - a.amount_usd);
  }, [allocations, totalValueUsd]);

  // Check if rebalancing is needed
  const needsRebalancing = useMemo(() => requiredTrades.length > 0, [requiredTrades]);

  // Total deviation from targets
  const totalDeviation = useMemo(() => {
    const activeAllocations = allocations.filter(a => a.is_active && a.target_percentage > 0);
    return activeAllocations.reduce((sum, a) => {
      return sum + Math.abs(a.current_percentage - a.target_percentage);
    }, 0);
  }, [allocations]);

  // Save allocation target
  const setTargetAllocation = async (
    tokenSymbol: string,
    targetPercentage: number,
    deviationThreshold?: number
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

      const allocation = allocations.find(a => a.token_symbol === tokenSymbol);
      const asset = portfolioAssets.find(a => a.symbol === tokenSymbol);

      if (allocation?.id) {
        // Update existing
        const { error } = await supabase
          .from('portfolio_allocations')
          .update({
            target_percentage: targetPercentage,
            deviation_threshold: deviationThreshold ?? allocation.deviation_threshold,
            updated_at: new Date().toISOString(),
          })
          .eq('id', allocation.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('portfolio_allocations')
          .insert({
            user_id: user.id,
            wallet_address: publicKey.toBase58(),
            token_symbol: tokenSymbol,
            token_mint: asset?.mint,
            target_percentage: targetPercentage,
            deviation_threshold: deviationThreshold ?? 5,
          });

        if (error) throw error;
      }

      await fetchAllocations();
      toast({ title: "Target Updated", description: `${tokenSymbol} target set to ${targetPercentage}%` });
      return true;
    } catch (error: any) {
      console.error('Error setting allocation:', error);
      toast({ title: "Failed to update target", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Set all allocations at once (for equal distribution, etc.)
  const setAllAllocations = async (newAllocations: { symbol: string; percentage: number }[]): Promise<boolean> => {
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

      // Update each allocation
      for (const alloc of newAllocations) {
        await setTargetAllocation(alloc.symbol, alloc.percentage);
      }

      toast({ title: "Allocations Updated", description: "All target percentages saved" });
      return true;
    } catch (error: any) {
      console.error('Error setting allocations:', error);
      toast({ title: "Failed to update allocations", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute rebalance with real Jupiter swaps
  const executeRebalance = async (
    executeSwaps: (
      trades: RebalanceTrade[],
      solPrice: number,
      onProgress?: (status: string, progress: number) => void
    ) => Promise<{ completed: number; failed: number; txIds: string[] }>,
    solPrice: number,
    onProgress?: (status: string, progress: number) => void
  ): Promise<boolean> => {
    if (!publicKey || requiredTrades.length === 0) {
      toast({ title: "No rebalancing needed", variant: "destructive" });
      return false;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return false;
      }

      toast({ 
        title: "Rebalancing Portfolio", 
        description: `Executing ${requiredTrades.length} trades via Jupiter...` 
      });

      // Execute real swaps through Jupiter
      const swapResults = await executeSwaps(requiredTrades, solPrice, onProgress);

      const status = swapResults.failed === 0 ? 'completed' : 
                     swapResults.completed === 0 ? 'failed' : 'partial';

      // Record the rebalance
      const { error } = await supabase
        .from('rebalancing_history')
        .insert([{
          user_id: user.id,
          wallet_address: publicKey.toBase58(),
          rebalance_type: 'jupiter_swap',
          trades_executed: swapResults.completed,
          total_value_usd: totalValueUsd,
          status,
          details: JSON.parse(JSON.stringify({ 
            trades: requiredTrades,
            txIds: swapResults.txIds,
            completed: swapResults.completed,
            failed: swapResults.failed,
          })),
        }]);

      if (error) throw error;

      if (swapResults.completed > 0) {
        toast({
          title: status === 'completed' ? "Rebalance Complete!" : "Rebalance Partial",
          description: `Executed ${swapResults.completed}/${requiredTrades.length} trades successfully`,
        });
      }

      await fetchHistory();
      return swapResults.completed > 0;
    } catch (error: any) {
      console.error('Rebalance error:', error);
      toast({ title: "Rebalance Failed", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when wallet connects or portfolio changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchAllocations();
      fetchHistory();
    }
  }, [connected, publicKey, fetchAllocations, fetchHistory]);

  return {
    allocations,
    requiredTrades,
    history,
    isLoading,
    needsRebalancing,
    totalDeviation,
    setTargetAllocation,
    setAllAllocations,
    executeRebalance,
    refreshAllocations: fetchAllocations,
  };
};
