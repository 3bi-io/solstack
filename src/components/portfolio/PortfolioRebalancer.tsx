import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Scale,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  History,
  AlertCircle,
  CheckCircle2,
  Target,
  Shuffle,
  Equal,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { formatDistanceToNow } from "date-fns";

interface TokenAllocation {
  id?: string;
  token_symbol: string;
  target_percentage: number;
  current_percentage: number;
  current_value_usd: number;
  deviation_threshold: number;
  is_active: boolean;
}

interface RebalanceTrade {
  token_symbol: string;
  action: 'buy' | 'sell';
  amount_usd: number;
  percentage_change: number;
}

interface RebalanceHistory {
  id: string;
  rebalance_type: string;
  trades_executed: number;
  total_value_usd: number;
  status: string;
  created_at: string;
}

interface PortfolioRebalancerProps {
  allocations: TokenAllocation[];
  requiredTrades: RebalanceTrade[];
  history: RebalanceHistory[];
  isLoading: boolean;
  needsRebalancing: boolean;
  totalDeviation: number;
  totalValueUsd: number;
  onSetTarget: (symbol: string, percentage: number) => Promise<boolean>;
  onSetAllAllocations: (allocations: { symbol: string; percentage: number }[]) => Promise<boolean>;
  onExecuteRebalance: () => Promise<boolean>;
}

export const PortfolioRebalancer = ({
  allocations,
  requiredTrades,
  history,
  isLoading,
  needsRebalancing,
  totalDeviation,
  totalValueUsd,
  onSetTarget,
  onSetAllAllocations,
  onExecuteRebalance,
}: PortfolioRebalancerProps) => {
  const { connected } = useWallet();
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const totalTargetPercentage = allocations.reduce((sum, a) => sum + a.target_percentage, 0);

  const handleSetTarget = async (symbol: string) => {
    const value = parseFloat(editValue);
    if (isNaN(value) || value < 0 || value > 100) {
      return;
    }
    await onSetTarget(symbol, value);
    setEditingToken(null);
    setEditValue("");
  };

  const handleEqualDistribution = async () => {
    const activeAllocations = allocations.filter(a => a.current_value_usd > 0);
    const equalPct = Math.floor((100 / activeAllocations.length) * 10) / 10;
    const newAllocations = activeAllocations.map(a => ({
      symbol: a.token_symbol,
      percentage: equalPct,
    }));
    await onSetAllAllocations(newAllocations);
  };

  const handleMatchCurrent = async () => {
    const newAllocations = allocations
      .filter(a => a.current_value_usd > 0)
      .map(a => ({
        symbol: a.token_symbol,
        percentage: Math.round(a.current_percentage * 10) / 10,
      }));
    await onSetAllAllocations(newAllocations);
  };

  if (!connected) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-6 text-center">
          <Scale className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Portfolio Rebalancer</h3>
          <p className="text-muted-foreground mb-4">Connect your wallet to set target allocations</p>
          <WalletMultiButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Portfolio Rebalancer</CardTitle>
              <p className="text-sm text-muted-foreground">Set targets & auto-adjust allocations</p>
            </div>
          </div>
          
          {needsRebalancing ? (
            <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">
              <AlertCircle className="w-3 h-3" />
              {totalDeviation.toFixed(1)}% off target
            </Badge>
          ) : totalTargetPercentage > 0 ? (
            <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500 bg-green-500/10">
              <CheckCircle2 className="w-3 h-3" />
              Balanced
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEqualDistribution}
            disabled={isLoading || allocations.length === 0}
            className="flex-1 gap-1"
          >
            <Equal className="w-4 h-4" />
            Equal Split
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMatchCurrent}
            disabled={isLoading || allocations.length === 0}
            className="flex-1 gap-1"
          >
            <Target className="w-4 h-4" />
            Match Current
          </Button>
        </div>

        {/* Allocations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Token Allocations</span>
            <span className="text-muted-foreground">
              Total Target: <span className={totalTargetPercentage === 100 ? "text-green-500" : "text-yellow-500"}>
                {totalTargetPercentage.toFixed(1)}%
              </span>
            </span>
          </div>

          {allocations.length === 0 ? (
            <div className="p-4 text-center rounded-lg border border-border/50 bg-muted/20">
              <p className="text-muted-foreground">No assets in portfolio</p>
            </div>
          ) : (
            allocations.filter(a => a.current_value_usd > 0).map((allocation) => {
              const deviation = allocation.current_percentage - allocation.target_percentage;
              const isEditing = editingToken === allocation.token_symbol;

              return (
                <div
                  key={allocation.token_symbol}
                  className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{allocation.token_symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        ${allocation.current_value_usd.toFixed(2)}
                      </span>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 h-8 text-sm"
                          placeholder="%"
                          min={0}
                          max={100}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSetTarget(allocation.token_symbol)}
                          disabled={isLoading}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingToken(null);
                            setEditValue("");
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingToken(allocation.token_symbol);
                          setEditValue(allocation.target_percentage.toString());
                        }}
                        className="gap-1"
                      >
                        <Target className="w-4 h-4" />
                        {allocation.target_percentage > 0 ? `${allocation.target_percentage}%` : "Set target"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Current: {allocation.current_percentage.toFixed(1)}%</span>
                      {allocation.target_percentage > 0 && (
                        <span className={deviation > 0 ? "text-red-400" : deviation < 0 ? "text-green-400" : ""}>
                          {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}% deviation
                        </span>
                      )}
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${Math.min(allocation.current_percentage, 100)}%` }}
                      />
                      {allocation.target_percentage > 0 && (
                        <div
                          className="absolute h-full w-0.5 bg-green-500"
                          style={{ left: `${Math.min(allocation.target_percentage, 100)}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Required Trades */}
        {requiredTrades.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-yellow-500" />
              Required Trades ({requiredTrades.length})
            </h4>
            
            {requiredTrades.map((trade, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-border/50 bg-muted/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {trade.action === 'buy' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={trade.action === 'buy' ? "text-green-500" : "text-red-500"}>
                    {trade.action.toUpperCase()}
                  </span>
                  <span className="font-medium">{trade.token_symbol}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono">${trade.amount_usd.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {trade.percentage_change > 0 ? '-' : '+'}{Math.abs(trade.percentage_change).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}

            <Button
              onClick={onExecuteRebalance}
              disabled={isLoading}
              className="w-full gap-2"
            >
              <Scale className="w-4 h-4" />
              Execute Rebalance
            </Button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Rebalancing History
                </span>
                {historyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-border/30 bg-muted/10 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{item.trades_executed} trades executed</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.total_value_usd.toFixed(2)} portfolio • {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500">
                    <CheckCircle2 className="w-3 h-3" />
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
