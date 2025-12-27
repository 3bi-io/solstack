import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface BridgeTransaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  txHash: string;
}

const MOCK_TRANSACTIONS: BridgeTransaction[] = [
  {
    id: "1",
    fromToken: "SOL",
    toToken: "GEN1",
    fromAmount: 10.5,
    toAmount: 11.025,
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    txHash: "5KtN...8xPq",
  },
  {
    id: "2",
    fromToken: "GEN1",
    toToken: "SOL",
    fromAmount: 25.0,
    toAmount: 23.81,
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    txHash: "3AbC...7yZm",
  },
  {
    id: "3",
    fromToken: "SOL",
    toToken: "GEN1",
    fromAmount: 5.0,
    toAmount: 5.25,
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    txHash: "9XyZ...4wKn",
  },
  {
    id: "4",
    fromToken: "SOL",
    toToken: "GEN1",
    fromAmount: 100.0,
    toAmount: 105.0,
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    txHash: "7PqR...2mNb",
  },
  {
    id: "5",
    fromToken: "GEN1",
    toToken: "SOL",
    fromAmount: 50.0,
    toAmount: 47.62,
    status: "failed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    txHash: "1LmN...6vQp",
  },
];

export const BridgeTransactionHistory = () => {
  const [transactions] = useState<BridgeTransaction[]>(MOCK_TRANSACTIONS);

  const getStatusBadge = (status: BridgeTransaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500 bg-green-500/10">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">
            <Clock className="w-3 h-3 animate-pulse" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="gap-1 border-red-500/50 text-red-500 bg-red-500/10">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getTokenIcon = (symbol: string) => {
    return symbol === "SOL" ? "◎" : "◆";
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 font-mono">
            <History className="w-5 h-5 text-muted-foreground" />
            Transaction History
          </CardTitle>
          <Button variant="ghost" size="sm" className="gap-1">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Bridge some assets to see your history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-card border border-border/50 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      {/* From */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTokenIcon(tx.fromToken)}</span>
                        <div>
                          <p className="font-semibold">{tx.fromAmount.toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">{tx.fromToken}</p>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-accent" />

                      {/* To */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTokenIcon(tx.toToken)}</span>
                        <div>
                          <p className="font-semibold">{tx.toAmount.toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">{tx.toToken}</p>
                        </div>
                      </div>
                    </div>

                    {getStatusBadge(tx.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(tx.timestamp)}
                      </span>
                      <span className="font-mono">{tx.txHash}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
