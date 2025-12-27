import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUsd } from "@/lib/utils";

interface PortfolioValueCardProps {
  totalValue: number;
  change24h: number;
  changePercent: number;
  profitLoss: number;
  profitLossPercent: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PortfolioValueCard({
  totalValue,
  change24h,
  changePercent,
  profitLoss,
  profitLossPercent,
  isLoading,
  onRefresh,
}: PortfolioValueCardProps) {
  const isPositive24h = change24h >= 0;
  const isPositivePL = profitLoss >= 0;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/5 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Portfolio Value
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-10 w-40" />
        ) : (
          <div className="text-4xl font-bold tracking-tight">
            {formatUsd(totalValue)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* 24h Change */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">24h Change</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className={`flex items-center gap-1 ${isPositive24h ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive24h ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">
                  {isPositive24h ? '+' : ''}{formatUsd(change24h)}
                </span>
                <span className="text-xs">
                  ({isPositive24h ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          {/* Total P/L */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total P/L</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className={`flex items-center gap-1 ${isPositivePL ? 'text-green-500' : 'text-red-500'}`}>
                {isPositivePL ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">
                  {isPositivePL ? '+' : ''}{formatUsd(profitLoss)}
                </span>
                <span className="text-xs">
                  ({isPositivePL ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
