import { TrendingUp, Shield, Activity } from 'lucide-react';
import { useOptimizedSolPrice } from '@/hooks/useOptimizedSolPrice';

export const DashboardPreview = () => {
  const { solPrice, isLoading } = useOptimizedSolPrice();

  const topPools = [
    { pair: 'SOL-USDC', apy: '12.4%', risk: 'Low' },
    { pair: 'GEN1-SOL', apy: '24.8%', risk: 'Med' },
    { pair: 'RAY-SOL', apy: '18.2%', risk: 'Low' },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto mt-8">
      {/* Terminal-style frame */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-xl blur-sm" />
      
      <div className="relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs font-mono text-muted-foreground ml-2">solstack.me/dashboard</span>
        </div>

        {/* Dashboard content */}
        <div className="p-4 space-y-4">
          {/* SOL Price Widget */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground">SOL/USD</p>
                <p className="text-lg font-mono font-bold text-foreground">
                  {isLoading ? '---' : `$${solPrice?.toFixed(2) || '0.00'}`}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-green-400">+2.4%</span>
          </div>

          {/* Top Pools */}
          <div className="space-y-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Top Pools</p>
            {topPools.map((pool) => (
              <div key={pool.pair} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/20">
                <span className="text-sm font-mono text-foreground">{pool.pair}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-accent">{pool.apy}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    pool.risk === 'Low' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pool.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Risk Score */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-muted-foreground">AI Risk Monitor</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-green-400" />
              <span className="text-xs font-mono text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
