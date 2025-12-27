import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Coins, TrendingUp, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickStatsProps {
  totalAssets: number;
  solBalance: number;
  bestPerformer: { symbol: string; change: number } | null;
  isLoading: boolean;
}

export function QuickStats({ totalAssets, solBalance, bestPerformer, isLoading }: QuickStatsProps) {
  const stats = [
    {
      label: 'Total Assets',
      value: isLoading ? null : totalAssets.toString(),
      icon: Coins,
      color: 'text-primary',
    },
    {
      label: 'SOL Balance',
      value: isLoading ? null : `${solBalance.toFixed(4)} SOL`,
      icon: Wallet,
      color: 'text-accent',
    },
    {
      label: 'Best Performer',
      value: isLoading ? null : bestPerformer ? `${bestPerformer.symbol} +${bestPerformer.change.toFixed(1)}%` : 'N/A',
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            {stat.value === null ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <p className="font-semibold text-sm truncate">{stat.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
