import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  BarChart3,
  Sprout
} from "lucide-react";

interface FarmStatsProps {
  totalTvl: number;
  totalStaked: number;
  totalRewards: number;
  activeFarms: number;
  averageApy: number;
}

export const FarmStats = ({ 
  totalTvl, 
  totalStaked, 
  totalRewards, 
  activeFarms,
  averageApy 
}: FarmStatsProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const stats = [
    {
      icon: BarChart3,
      label: "Total Value Locked",
      value: formatNumber(totalTvl),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Wallet,
      label: "Your Total Staked",
      value: formatNumber(totalStaked),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Coins,
      label: "Pending Rewards",
      value: formatNumber(totalRewards),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Sprout,
      label: "Active Farms",
      value: activeFarms.toString(),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: TrendingUp,
      label: "Average APY",
      value: `${averageApy.toFixed(1)}%`,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};