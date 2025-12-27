import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { SEO } from "@/components/SEO";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, BarChart3 } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { usePortfolioRebalancer } from "@/hooks/usePortfolioRebalancer";
import { useJupiterRebalance } from "@/hooks/useJupiterRebalance";
import { useOptimizedSolPrice } from "@/hooks/useOptimizedSolPrice";
import { PortfolioValueCard } from "@/components/portfolio/PortfolioValueCard";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { AssetAllocation } from "@/components/portfolio/AssetAllocation";
import { QuickStats } from "@/components/portfolio/QuickStats";
import { PortfolioRebalancer } from "@/components/portfolio/PortfolioRebalancer";
import { useMemo, useState, useCallback } from "react";

export default function Portfolio() {
  const { connected } = useWallet();
  const { assets, history, stats, isLoading, refresh } = usePortfolioData();
  const { solPrice } = useOptimizedSolPrice();
  const { executeRebalanceSwaps, isLoading: swapLoading, currentStep } = useJupiterRebalance();
  const [rebalanceProgress, setRebalanceProgress] = useState(0);

  // Convert assets to format expected by rebalancer
  const portfolioAssets = useMemo(() => {
    return assets.map(asset => ({
      symbol: asset.symbol,
      mint: asset.mint,
      balance: asset.balance,
      valueUsd: asset.usdValue,
    }));
  }, [assets]);

  const {
    allocations,
    requiredTrades,
    history: rebalanceHistory,
    isLoading: rebalancerLoading,
    needsRebalancing,
    totalDeviation,
    setTargetAllocation,
    setAllAllocations,
    executeRebalance,
  } = usePortfolioRebalancer(portfolioAssets, stats.totalValue);

  // Wrapper to execute rebalance with Jupiter swaps
  const handleExecuteRebalance = useCallback(async () => {
    setRebalanceProgress(0);
    const result = await executeRebalance(
      executeRebalanceSwaps,
      solPrice,
      (status, progress) => {
        setRebalanceProgress(progress);
      }
    );
    setRebalanceProgress(0);
    if (result) {
      refresh(); // Refresh portfolio data after successful rebalance
    }
    return result;
  }, [executeRebalance, executeRebalanceSwaps, solPrice, refresh]);

  const bestPerformer = assets.length > 0 
    ? assets.reduce((best, asset) => asset.change24h > best.change24h ? asset : best)
    : null;

  const portfolioStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Portfolio Analytics Dashboard",
    description: "Track your Solana portfolio value, P/L, and asset allocation in real-time.",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="Portfolio Dashboard - Track SOL Holdings & P/L | SOL Stack"
        description="Real-time portfolio analytics for your Solana holdings. Track total value, profit/loss, 24h changes, and asset allocation. Beautiful charts and insights."
        keywords="Solana portfolio, crypto portfolio tracker, SOL holdings, DeFi analytics, asset allocation, P/L tracker"
        url="/portfolio"
        structuredData={portfolioStructuredData}
      />
      <AppHeader />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* Hero Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Portfolio Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Track your assets, performance, and allocation
            </p>
          </div>
        </div>

        {!connected ? (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Connect your Solana wallet to view your portfolio analytics, 
                  including total value, P/L, and asset allocation.
                </p>
              </div>
              <WalletConnectButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Quick Stats */}
            <QuickStats
              totalAssets={assets.length}
              solBalance={assets.find(a => a.symbol === 'SOL')?.balance || 0}
              bestPerformer={bestPerformer ? { symbol: bestPerformer.symbol, change: bestPerformer.change24h } : null}
              isLoading={isLoading}
            />

            {/* Main Value Card */}
            <PortfolioValueCard
              totalValue={stats.totalValue}
              change24h={stats.totalChange24h}
              changePercent={stats.totalChangePercent}
              profitLoss={stats.profitLoss}
              profitLossPercent={stats.profitLossPercent}
              isLoading={isLoading}
              onRefresh={refresh}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PortfolioChart history={history} isLoading={isLoading} />
              <AssetAllocation assets={assets} isLoading={isLoading} />
            </div>

            {/* Portfolio Rebalancer */}
            <PortfolioRebalancer
              allocations={allocations}
              requiredTrades={requiredTrades}
              history={rebalanceHistory}
              isLoading={rebalancerLoading || isLoading || swapLoading}
              needsRebalancing={needsRebalancing}
              totalDeviation={totalDeviation}
              totalValueUsd={stats.totalValue}
              onSetTarget={setTargetAllocation}
              onSetAllAllocations={setAllAllocations}
              onExecuteRebalance={handleExecuteRebalance}
              swapProgress={rebalanceProgress}
              swapStep={currentStep}
            />
          </div>
        )}
      </div>

      <TelegramNavigation />
    </div>
  );
}
