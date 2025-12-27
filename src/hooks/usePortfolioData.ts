import { useMemo } from 'react';
import { useOptimizedWalletBalance } from './useOptimizedWalletBalance';
import { useOptimizedSolPrice } from './useOptimizedSolPrice';

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
 * Hook to calculate portfolio data from wallet balances
 */
export function usePortfolioData() {
  const { sol, tokens, isLoading: balanceLoading, refresh } = useOptimizedWalletBalance();
  const { solPrice, sol24hChange, isLoading: priceLoading } = useOptimizedSolPrice();

  const portfolioData = useMemo(() => {
    const solUsdValue = sol * (solPrice || 0);
    
    // Calculate token values (mock prices for demo - in production, fetch from API)
    const tokenAssets: PortfolioAsset[] = tokens.map((token, index) => ({
      symbol: token.symbol,
      name: token.mint.slice(0, 8) + '...',
      balance: token.balance,
      usdValue: token.balance * 0.001, // Mock value
      percentage: 0,
      change24h: Math.random() * 10 - 5, // Mock change
      color: ASSET_COLORS[index % ASSET_COLORS.length],
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

    // Calculate weighted 24h change
    const totalChange24h = assets.reduce((sum, asset) => {
      return sum + (asset.usdValue * (asset.change24h / 100));
    }, 0);
    const totalChangePercent = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;

    // Generate mock historical data (last 30 days)
    const history: PortfolioHistory[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      // Simulate gradual growth with some volatility
      const baseValue = totalValue * 0.8;
      const growthFactor = 1 + (i / 29) * 0.25;
      const volatility = Math.sin(i * 0.5) * totalValue * 0.05;
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, baseValue * growthFactor + volatility),
      };
    });

    // Add current value as last point
    if (history.length > 0) {
      history[history.length - 1].value = totalValue;
    }

    const stats: PortfolioStats = {
      totalValue,
      totalChange24h,
      totalChangePercent,
      profitLoss: totalValue * 0.15, // Mock 15% profit
      profitLossPercent: 15, // Mock
    };

    return { assets, history, stats };
  }, [sol, tokens, solPrice, sol24hChange]);

  return {
    ...portfolioData,
    isLoading: balanceLoading || priceLoading,
    refresh,
  };
}
