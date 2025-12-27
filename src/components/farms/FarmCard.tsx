import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronUp,
  Shield,
  Zap,
  Clock,
  Coins,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export interface Farm {
  id: string;
  name: string;
  token: string;
  tokenIcon: string;
  rewardToken: string;
  rewardIcon: string;
  apy: number;
  tvl: number;
  userStaked: number;
  pendingRewards: number;
  lockPeriod: number; // days
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  minStake: number;
  maxStake: number;
}

interface FarmCardProps {
  farm: Farm;
  onStake: (farmId: string, amount: number) => void;
  onWithdraw: (farmId: string, amount: number) => void;
  onClaim: (farmId: string) => void;
}

export const FarmCard = ({ farm, onStake, onWithdraw, onClaim }: FarmCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [activeTab, setActiveTab] = useState<'stake' | 'withdraw'>('stake');
  const { connected } = useWallet();

  const getRiskColor = (risk: Farm['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (amount < farm.minStake) {
      toast({ title: `Minimum stake is ${farm.minStake} ${farm.token}`, variant: "destructive" });
      return;
    }
    onStake(farm.id, amount);
    setStakeAmount("");
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (amount > farm.userStaked) {
      toast({ title: "Insufficient staked balance", variant: "destructive" });
      return;
    }
    onWithdraw(farm.id, amount);
    setWithdrawAmount("");
  };

  return (
    <Card className={`border-border/50 transition-all duration-300 ${isExpanded ? 'ring-2 ring-accent/30' : 'hover:border-accent/30'}`}>
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            {/* Token Icons */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-2xl border border-accent/30">
                {farm.tokenIcon}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center text-sm border border-border">
                {farm.rewardIcon}
              </div>
            </div>

            {/* Farm Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{farm.name}</h3>
                {farm.isActive && (
                  <Badge variant="outline" className="gap-1 text-xs border-green-500/50 text-green-500 bg-green-500/10">
                    <Zap className="w-3 h-3" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Stake {farm.token} → Earn {farm.rewardToken}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* APY */}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">APY</p>
              <p className="text-2xl font-bold text-green-500">{farm.apy.toFixed(2)}%</p>
            </div>

            {/* TVL */}
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">TVL</p>
              <p className="text-lg font-semibold">{formatNumber(farm.tvl)}</p>
            </div>

            {/* Risk Badge */}
            <Badge variant="outline" className={`gap-1 capitalize ${getRiskColor(farm.riskLevel)}`}>
              <Shield className="w-3 h-3" />
              {farm.riskLevel}
            </Badge>

            {/* Expand Icon */}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30">
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Lock Period
              </p>
              <p className="font-semibold">{farm.lockPeriod} days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Min Stake
              </p>
              <p className="font-semibold">{farm.minStake} {farm.token}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Your Staked
              </p>
              <p className="font-semibold">{farm.userStaked.toFixed(4)} {farm.token}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending Rewards
              </p>
              <p className="font-semibold text-accent">{farm.pendingRewards.toFixed(6)} {farm.rewardToken}</p>
            </div>
          </div>

          {/* Action Tabs */}
          {connected ? (
            <>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'stake' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('stake')}
                  className="flex-1"
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Stake
                </Button>
                <Button
                  variant={activeTab === 'withdraw' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('withdraw')}
                  className="flex-1"
                >
                  <Unlock className="w-4 h-4 mr-1" />
                  Withdraw
                </Button>
              </div>

              {activeTab === 'stake' ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`Amount in ${farm.token}`}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleStake} className="bg-gradient-to-r from-accent to-primary">
                      Stake
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Funds will be locked for {farm.lockPeriod} days after staking
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`Amount in ${farm.token}`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setWithdrawAmount(farm.userStaked.toString())}
                    >
                      MAX
                    </Button>
                    <Button onClick={handleWithdraw} variant="destructive">
                      Withdraw
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Available: {farm.userStaked.toFixed(4)} {farm.token}
                    </p>
                  </div>
                </div>
              )}

              {/* Claim Rewards Button */}
              {farm.pendingRewards > 0 && (
                <Button 
                  onClick={() => onClaim(farm.id)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Claim {farm.pendingRewards.toFixed(6)} {farm.rewardToken}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">Connect wallet to stake</p>
              <WalletMultiButton className="!bg-gradient-to-r !from-accent !to-primary !rounded-lg" />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};