import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { hardRefresh } from "@/lib/hard-refresh";

interface BridgeTransaction {
  id: string;
  from_token: string;
  to_token: string;
  amount: number;
  output_amount: number;
  status: string;
  created_at: string;
  transaction_signature: string;
  wallet_address: string;
}

export const BridgeTransactionHistory = () => {
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey, connected } = useWallet();

  const fetchTransactions = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bridge_transactions')
        .select('*')
        .eq('wallet_address', publicKey.toBase58())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactions();
    }
  }, [connected, publicKey]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!publicKey) return;

    const channel = supabase
      .channel('bridge-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bridge_transactions',
          filter: `wallet_address=eq.${publicKey.toBase58()}`
        },
        (payload) => {
          setTransactions(prev => [payload.new as BridgeTransaction, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [publicKey]);

  const getStatusBadge = (status: string) => {
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
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
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

  const truncateSignature = (sig: string) => {
    return `${sig.slice(0, 4)}...${sig.slice(-4)}`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 font-mono">
            <History className="w-5 h-5 text-muted-foreground" />
            Transaction History
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => hardRefresh()}
            disabled={isLoading || !connected}
            title="Hard refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {!connected ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Connect wallet to view history</p>
              <p className="text-sm">Your bridge transactions will appear here</p>
            </div>
          ) : transactions.length === 0 ? (
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
                        <span className="text-xl">{getTokenIcon(tx.from_token)}</span>
                        <div>
                          <p className="font-semibold">{Number(tx.amount).toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">{tx.from_token}</p>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-accent" />

                      {/* To */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTokenIcon(tx.to_token)}</span>
                        <div>
                          <p className="font-semibold">{Number(tx.output_amount).toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">{tx.to_token}</p>
                        </div>
                      </div>
                    </div>

                    {getStatusBadge(tx.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(tx.created_at)}
                      </span>
                      <span className="font-mono">{truncateSignature(tx.transaction_signature)}</span>
                    </div>
                    <a 
                      href={`https://solscan.io/tx/${tx.transaction_signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
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