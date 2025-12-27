import { useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOptimizedWalletBalance } from './useOptimizedWalletBalance';
import { useOptimizedSolPrice } from './useOptimizedSolPrice';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, staleTimes } from './useApiQuery';

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  percentage: number;
  change24h: number;
  color: string;
}

interface PortfolioHistory {
  date: string;
  value: number;
}

interface PortfolioStats {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface PortfolioSnapshot {
  id: string;
  user_id: string;
  wallet_address: string;
  total_value_usd: number;
  sol_balance: number;
  sol_price_usd: number;
  token_count: number;
  snapshot_date: string;
  created_at: string;
}

const ASSET_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

/**
 * Hook to fetch and manage portfolio snapshots
 */
function usePortfolioSnapshots(walletAddress: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['portfolio-snapshots', user?.id, walletAddress],
    queryFn: async (): Promise<PortfolioSnapshot[]> => {
      if (!user?.id || !walletAddress) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_address', walletAddress)
        .gte('snapshot_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return (data as PortfolioSnapshot[]) ?? [];
    },
    enabled: !!user?.id && !!walletAddress,
    staleTime: staleTimes.user,
  });

  const saveSnapshot = async (
    totalValue: number,
    solBalance: number,
    solPrice: number,
    tokenCount: number
  ) => {
    if (!user?.id || !walletAddress) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('portfolio_snapshots')
        .upsert(
          {
            user_id: user.id,
            wallet_address: walletAddress,
            total_value_usd: totalValue,
            sol_balance: solBalance,
            sol_price_usd: solPrice,
            token_count: tokenCount,
            snapshot_date: today,
          },
          {
            onConflict: 'user_id,wallet_address,snapshot_date',
          }
        );

      if (error) {
        console.error('Error saving portfolio snapshot:', error);
      } else {
        queryClient.invalidateQueries({ 
          queryKey: ['portfolio-snapshots', user.id, walletAddress] 
        });
      }
    } catch (err) {
      console.error('Failed to save snapshot:', err);
    }
  };

  return {
    snapshots: query.data ?? [],
    isLoading: query.isLoading,
    saveSnapshot,
  };
}

/**
 * Hook to calculate portfolio data from wallet balances with historical tracking
 */
export function usePortfolioData() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const { sol, tokens, isLoading: balanceLoading, refresh } = useOptimizedWalletBalance();
  const { solPrice, sol24hChange, isLoading: priceLoading } = useOptimizedSolPrice();
  const { snapshots, isLoading: snapshotsLoading, saveSnapshot } = usePortfolioSnapshots(walletAddress);

  const portfolioData = useMemo(() => {
    const solUsdValue = sol * (solPrice || 0);
    
    // Calculate token values (mock prices for demo - in production, fetch from API)
    const tokenAssets: PortfolioAsset[] = tokens.map((token, index) => ({
      symbol: token.symbol,
      name: token.mint.slice(0, 8) + '...',
      balance: token.balance,
      usdValue: token.balance * 0.001, // Mock value - replace with real prices
      percentage: 0,
      change24h: Math.random() * 10 - 5, // Mock change
      color: ASSET_COLORS[(index + 1) % ASSET_COLORS.length],
    }));

    const assets: PortfolioAsset[] = [
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: sol,
        usdValue: solUsdValue,
        percentage: 0,
        change24h: sol24hChange || 0,
        color: ASSET_COLORS[0],
      },
      ...tokenAssets,
    ];

    const totalValue = assets.reduce((sum, asset) => sum + asset.usdValue, 0);

    // Calculate percentages
    assets.forEach(asset => {
      asset.percentage = totalValue > 0 ? (asset.usdValue / totalValue) * 100 : 0;
    });

    // Calculate 24h change from snapshots if available
    let totalChange24h = 0;
    let totalChangePercent = 0;

    if (snapshots.length > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const yesterdaySnapshot = snapshots.find(s => s.snapshot_date === yesterdayStr);
      if (yesterdaySnapshot && yesterdaySnapshot.total_value_usd > 0) {
        totalChange24h = totalValue - yesterdaySnapshot.total_value_usd;
        totalChangePercent = (totalChange24h / yesterdaySnapshot.total_value_usd) * 100;
      } else {
        // Fallback to weighted calculation
        totalChange24h = assets.reduce((sum, asset) => {
          return sum + (asset.usdValue * (asset.change24h / 100));
        }, 0);
        totalChangePercent = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;
      }
    }

    // Build history from snapshots
    const history: PortfolioHistory[] = snapshots.map(snapshot => ({
      date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      value: snapshot.total_value_usd,
    }));

    // Add current value as latest point if we have data
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (history.length === 0 || history[history.length - 1].date !== today) {
      history.push({ date: today, value: totalValue });
    } else {
      history[history.length - 1].value = totalValue;
    }

    // Calculate P/L from first snapshot
    let profitLoss = 0;
    let profitLossPercent = 0;
    
    if (snapshots.length > 0) {
      const firstSnapshot = snapshots[0];
      profitLoss = totalValue - firstSnapshot.total_value_usd;
      profitLossPercent = firstSnapshot.total_value_usd > 0 
        ? (profitLoss / firstSnapshot.total_value_usd) * 100 
        : 0;
    }

    const stats: PortfolioStats = {
      totalValue,
      totalChange24h,
      totalChangePercent,
      profitLoss,
      profitLossPercent,
    };

    return { assets, history, stats, tokenCount: tokens.length };
  }, [sol, tokens, solPrice, sol24hChange, snapshots]);

  // Auto-save snapshot when portfolio data changes
  useEffect(() => {
    if (
      !balanceLoading && 
      !priceLoading && 
      walletAddress && 
      portfolioData.stats.totalValue > 0 &&
      solPrice
    ) {
      const debounceTimer = setTimeout(() => {
        saveSnapshot(
          portfolioData.stats.totalValue,
          sol,
          solPrice,
          portfolioData.tokenCount
        );
      }, 2000);

      return () => clearTimeout(debounceTimer);
    }
  }, [
    balanceLoading, 
    priceLoading, 
    walletAddress, 
    portfolioData.stats.totalValue, 
    sol, 
    solPrice,
    portfolioData.tokenCount,
    saveSnapshot
  ]);

  return {
    assets: portfolioData.assets,
    history: portfolioData.history,
    stats: portfolioData.stats,
    isLoading: balanceLoading || priceLoading || snapshotsLoading,
    refresh,
  };
}
