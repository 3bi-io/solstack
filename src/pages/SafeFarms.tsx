import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { FarmCard, Farm } from "@/components/farms/FarmCard";
import { FarmStats } from "@/components/farms/FarmStats";
import { RewardsHistory } from "@/components/farms/RewardsHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
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

// Mock reward events
const MOCK_EVENTS = [
  {
    id: "1",
    type: "claim" as const,
    farmName: "SOL Staking",
    amount: 0.0234,
    token: "SOL",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    txHash: "5KtN...8xPq",
  },
  {
    id: "2",
    type: "stake" as const,
    farmName: "GEN1/SOL LP",
    amount: 100,
    token: "LP",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    txHash: "3AbC...7yZm",
  },
  {
    id: "3",
    type: "withdraw" as const,
    farmName: "Stable Vault",
    amount: 500,
    token: "USDC",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    txHash: "9XyZ...4wKn",
  },
];

const SafeFarms = () => {
  const [farms, setFarms] = useState<Farm[]>(MOCK_FARMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("apy");
  const { connected } = useWallet();

  const filteredFarms = useMemo(() => {
    let result = farms.filter(farm => {
      const matchesSearch = farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.token.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "all" || farm.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });

    // Sort
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

  const handleStake = (farmId: string, amount: number) => {
    if (!connected) {
      toast({ title: "Please connect your wallet", variant: "destructive" });
      return;
    }
    
    setFarms(prev => prev.map(farm => 
      farm.id === farmId 
        ? { ...farm, userStaked: farm.userStaked + amount }
        : farm
    ));
    
    toast({
      title: "Stake Successful",
      description: `Staked ${amount} tokens in the farm`,
    });
  };

  const handleWithdraw = (farmId: string, amount: number) => {
    if (!connected) {
      toast({ title: "Please connect your wallet", variant: "destructive" });
      return;
    }
    
    setFarms(prev => prev.map(farm => 
      farm.id === farmId 
        ? { ...farm, userStaked: Math.max(0, farm.userStaked - amount) }
        : farm
    ));
    
    toast({
      title: "Withdrawal Successful",
      description: `Withdrew ${amount} tokens from the farm`,
    });
  };

  const handleClaim = (farmId: string) => {
    if (!connected) {
      toast({ title: "Please connect your wallet", variant: "destructive" });
      return;
    }
    
    const farm = farms.find(f => f.id === farmId);
    if (farm && farm.pendingRewards > 0) {
      setFarms(prev => prev.map(f => 
        f.id === farmId 
          ? { ...f, pendingRewards: 0 }
          : f
      ));
      
      toast({
        title: "Rewards Claimed!",
        description: `Claimed ${farm.pendingRewards.toFixed(6)} ${farm.rewardToken}`,
      });
    }
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
                />
              ))
            )}
          </div>

          {/* Rewards History */}
          <RewardsHistory events={MOCK_EVENTS} />
        </main>

        <TelegramNavigation />
      </div>
    </>
  );
};

export default SafeFarms;