import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, 
  Shield, 
  CheckCircle, 
  TrendingUp,
  Droplets,
  Clock,
  ExternalLink,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOptimizedWalletBalance } from "@/hooks/useOptimizedWalletBalance";
import { useOptimizedSolPrice } from "@/hooks/useOptimizedSolPrice";

interface VaultData {
  solLocked: number;
  gen1Locked: number;
  totalValueLocked: number;
  utilizationRate: number;
  lastAudit: string;
  status: 'healthy' | 'warning' | 'critical';
}

const VAULT_DATA: VaultData = {
  solLocked: 125420.5,
  gen1Locked: 131691.52,
  totalValueLocked: 24500000,
  utilizationRate: 72,
  lastAudit: "Dec 15, 2025",
  status: 'healthy',
};

export const VaultStatus = () => {
  const { connected, publicKey } = useWallet();
  const { sol: solBalance, solFormatted } = useOptimizedWalletBalance();
  const { solPrice } = useOptimizedSolPrice();

  const walletValueUsd = connected ? solBalance * (solPrice || 0) : 0;

  const statusColor = {
    healthy: 'text-green-500 border-green-500/50 bg-green-500/10',
    warning: 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10',
    critical: 'text-red-500 border-red-500/50 bg-red-500/10',
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-card via-card to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 font-mono">
            <Lock className="w-5 h-5 text-accent" />
            Vault Status
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`gap-1 ${statusColor[VAULT_DATA.status]}`}
          >
            <CheckCircle className="w-3 h-3" />
            {VAULT_DATA.status.charAt(0).toUpperCase() + VAULT_DATA.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Your Wallet */}
        {connected && publicKey && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Wallet</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold font-mono">{solFormatted} SOL</p>
                <p className="text-xs text-muted-foreground">≈ ${walletValueUsd.toFixed(2)} USD</p>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </Badge>
            </div>
          </div>
        )}

        {/* TVL */}
        <div className="p-4 rounded-xl bg-background/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Total Value Locked</span>
          </div>
          <p className="text-2xl font-bold font-mono">
            ${formatNumber(VAULT_DATA.totalValueLocked)}
          </p>
        </div>

        {/* Locked Assets */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Locked Assets</h4>
          
          <div className="p-3 rounded-lg bg-background/30 border border-border/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">◎</span>
                <span className="font-medium">SOL</span>
              </div>
              <span className="font-mono font-semibold">
                {formatNumber(VAULT_DATA.solLocked)}
              </span>
            </div>
            <Progress value={65} className="h-1.5" />
          </div>

          <div className="p-3 rounded-lg bg-background/30 border border-border/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">◆</span>
                <span className="font-medium">GEN1</span>
              </div>
              <span className="font-mono font-semibold">
                {formatNumber(VAULT_DATA.gen1Locked)}
              </span>
            </div>
            <Progress value={72} className="h-1.5" />
          </div>
        </div>

        {/* Utilization */}
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Utilization Rate</span>
            </div>
            <span className="font-semibold">{VAULT_DATA.utilizationRate}%</span>
          </div>
          <Progress value={VAULT_DATA.utilizationRate} className="h-2" />
        </div>

        {/* Audit Info */}
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">Audited Contract</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last audit: {VAULT_DATA.lastAudit}
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
              View <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Security Features
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Multi-sig", active: true },
              { label: "Time-lock", active: true },
              { label: "Rate Limit", active: true },
              { label: "Emergency Pause", active: true },
            ].map((feature) => (
              <div 
                key={feature.label}
                className="flex items-center gap-1.5 text-xs p-2 rounded bg-background/30"
              >
                <CheckCircle className={`w-3 h-3 ${feature.active ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
