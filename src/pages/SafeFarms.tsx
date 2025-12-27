import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { FarmCard, Farm } from "@/components/farms/FarmCard";
import { FarmStats } from "@/components/farms/FarmStats";
import { RewardsHistory } from "@/components/farms/RewardsHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Sprout, 
  Shield, 
  Search,
  Filter,
  TrendingUp,
  Lock,
  Sparkles,
  Info
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFarmStaking } from "@/hooks/useFarmStaking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock farms data
const MOCK_FARMS: Farm[] = [
  {
    id: "1",
    name: "SOL Staking",
    token: "SOL",
    tokenIcon: "◎",
    rewardToken: "SOL",
    rewardIcon: "◎",
    apy: 7.5,
    tvl: 125000000,
    userStaked: 0,
    pendingRewards: 0,
    lockPeriod: 0,
    riskLevel: "low",
    isActive: true,
    minStake: 0.1,
    maxStake: 10000,
  },
  {
    id: "2",
    name: "GEN1/SOL LP",
    token: "GEN1-SOL LP",
    tokenIcon: "◆",
    rewardToken: "GEN1",
    rewardIcon: "◆",
    apy: 45.2,
    tvl: 8500000,
    userStaked: 0,
    pendingRewards: 0,
    lockPeriod: 7,
    riskLevel: "medium",
    isActive: true,
    minStake: 1,
    maxStake: 100000,
  },
  {
    id: "3",
    name: "Stable Vault",
    token: "USDC",
    tokenIcon: "$",
    rewardToken: "SOL",
    rewardIcon: "◎",
    apy: 12.8,
    tvl: 45000000,
    userStaked: 0,
    pendingRewards: 0,
    lockPeriod: 30,
    riskLevel: "low",
    isActive: true,
    minStake: 10,
    maxStake: 1000000,
  },
  {
    id: "4",
    name: "High Yield SOL",
    token: "SOL",
    tokenIcon: "◎",
    rewardToken: "GEN1",
    rewardIcon: "◆",
    apy: 85.5,
    tvl: 2500000,
    userStaked: 0,
    pendingRewards: 0,
    lockPeriod: 90,
    riskLevel: "high",
    isActive: true,
    minStake: 5,
    maxStake: 500,
  },
  {
    id: "5",
    name: "mSOL Liquid Staking",
    token: "mSOL",
    tokenIcon: "◎",
    rewardToken: "mSOL",
    rewardIcon: "◎",
    apy: 6.8,
    tvl: 320000000,
    userStaked: 0,
    pendingRewards: 0,
    lockPeriod: 0,
    riskLevel: "low",
    isActive: true,
    minStake: 0.01,
    maxStake: 50000,
  },
];

const SafeFarms = () => {
  const [baseFarms] = useState<Farm[]>(MOCK_FARMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("apy");
  const { connected } = useWallet();
  const { 
    positions, 
    transactions, 
    isLoading, 
    stake, 
    withdraw, 
    claim,
    compound,
    toggleAutoCompound,
    getPosition 
  } = useFarmStaking();

  // Merge base farms with user positions
  const farms = useMemo(() => {
    return baseFarms.map(farm => {
      const position = getPosition(farm.id);
      return {
        ...farm,
        userStaked: position ? Number(position.staked_amount) : 0,
        pendingRewards: position ? Number(position.pending_rewards) : 0,
        autoCompoundEnabled: position?.auto_compound_enabled || false,
        autoCompoundThreshold: position?.auto_compound_threshold || 0.01,
      };
    });
  }, [baseFarms, positions, getPosition]);

  // Convert transactions to events format for RewardsHistory
  const rewardEvents = useMemo(() => {
    return transactions.map(tx => ({
      id: tx.id,
      type: tx.transaction_type as 'stake' | 'withdraw' | 'claim',
      farmName: tx.farm_name,
      amount: Number(tx.amount),
      token: tx.token,
      timestamp: new Date(tx.created_at),
      txHash: tx.transaction_signature || undefined,
    }));
  }, [transactions]);

  const filteredFarms = useMemo(() => {
    let result = farms.filter(farm => {
      const matchesSearch = farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.token.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "all" || farm.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy;
        case "tvl":
          return b.tvl - a.tvl;
        case "risk":
          const riskOrder = { low: 0, medium: 1, high: 2 };
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        default:
          return 0;
      }
    });

    return result;
  }, [farms, searchQuery, riskFilter, sortBy]);

  const stats = useMemo(() => {
    const totalTvl = farms.reduce((sum, farm) => sum + farm.tvl, 0);
    const totalStaked = farms.reduce((sum, farm) => sum + farm.userStaked, 0);
    const totalRewards = farms.reduce((sum, farm) => sum + farm.pendingRewards, 0);
    const activeFarms = farms.filter(f => f.isActive).length;
    const averageApy = farms.reduce((sum, farm) => sum + farm.apy, 0) / farms.length;
    return { totalTvl, totalStaked, totalRewards, activeFarms, averageApy };
  }, [farms]);

  const handleStake = async (farmId: string, amount: number) => {
    const farm = farms.find(f => f.id === farmId);
    if (!farm) return;
    await stake(farmId, farm.name, farm.token, amount, farm.lockPeriod);
  };

  const handleWithdraw = async (farmId: string, amount: number) => {
    const farm = farms.find(f => f.id === farmId);
    if (!farm) return;
    await withdraw(farmId, farm.name, farm.token, amount);
  };

  const handleClaim = async (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    if (!farm || farm.pendingRewards <= 0) return;
    await claim(farmId, farm.name, farm.rewardToken, farm.pendingRewards);
  };

  const handleCompound = async (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    if (!farm) return;
    await compound(farmId, farm.name, farm.token);
  };

  const handleToggleAutoCompound = async (farmId: string, enabled: boolean, threshold: number) => {
    await toggleAutoCompound(farmId, enabled, threshold);
  };

  return (
    <>
      <Helmet>
        <title>Safe Farms - Stake & Earn | SolStack</title>
        <meta name="description" content="Stake your tokens in audited, secure farms with competitive APY. Low-risk staking opportunities on Solana." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <AppHeader />

        <main className="container mx-auto px-4 py-8 pb-24 space-y-8">
          {/* Hero Section */}
          <Card className="relative overflow-hidden border-accent/20 bg-gradient-to-br from-card via-card to-green-500/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />
            
            <CardContent className="relative p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <Sprout className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold font-mono">Safe Farms</h1>
                      <p className="text-muted-foreground">Audited staking with competitive yields</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500 bg-green-500/10">
                      <Shield className="w-3 h-3" />
                      Audited Contracts
                    </Badge>
                    <Badge variant="outline" className="gap-1 border-blue-500/50 text-blue-500 bg-blue-500/10">
                      <Lock className="w-3 h-3" />
                      Timelock Protected
                    </Badge>
                    <Badge variant="outline" className="gap-1 border-accent/50 text-accent bg-accent/10">
                      <Sparkles className="w-3 h-3" />
                      Auto-Compound
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    All farms are vetted for security. Lower risk = Lower APY.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <FarmStats {...stats} />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apy">Highest APY</SelectItem>
                <SelectItem value="tvl">Highest TVL</SelectItem>
                <SelectItem value="risk">Lowest Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Farms Grid */}
          <div className="grid gap-4">
            {filteredFarms.length === 0 ? (
              <Card className="p-12 text-center">
                <Sprout className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No farms found matching your criteria</p>
              </Card>
            ) : (
              filteredFarms.map(farm => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  onStake={handleStake}
                  onWithdraw={handleWithdraw}
                  onClaim={handleClaim}
                  onCompound={handleCompound}
                  onToggleAutoCompound={handleToggleAutoCompound}
                />
              ))
            )}
          </div>

          {/* Rewards History */}
          <RewardsHistory events={rewardEvents} />
        </main>

        <TelegramNavigation />
      </div>
    </>
  );
};

export default SafeFarms;