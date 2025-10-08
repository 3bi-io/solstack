import { useState, useEffect } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownLeft, Search, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'token_launch' | 'airdrop';
  amount: number;
  token: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  signature: string;
  recipient?: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { isConnected } = useWallet();

  // Fetch real transaction data
  useEffect(() => {
    const fetchTransactions = async () => {
      if (isConnected) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        if (data) {
          const formatted: Transaction[] = data.map(tx => ({
            id: tx.id,
            type: tx.type as any,
            amount: parseFloat(tx.amount.toString()),
            token: tx.token,
            status: tx.status as any,
            timestamp: new Date(tx.created_at),
            signature: tx.signature || 'pending',
            recipient: tx.recipient || undefined,
          }));
          setTransactions(formatted);
        }
      }
    };

    fetchTransactions();
  }, [isConnected]);

  const filteredTransactions = transactions.filter(tx =>
    tx.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.signature.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-primary" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Success</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'send':
        return 'Send';
      case 'receive':
        return 'Receive';
      case 'token_launch':
        return 'Token Launch';
      case 'airdrop':
        return 'Airdrop';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View all your Solana transactions
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <Alert>
                <AlertDescription>
                  Please connect your wallet to view transaction history.
                </AlertDescription>
              </Alert>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No transactions found</p>
                <p className="text-xs mt-1">
                  {searchTerm ? "Try a different search term" : "Your transactions will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Signature</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {getTypeLabel(tx.type)}
                              </span>
                              {tx.recipient && (
                                <span className="text-xs text-muted-foreground">
                                  To: {tx.recipient}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {tx.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {tx.token}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(tx.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(tx.timestamp, "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={`https://solscan.io/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-mono"
                          >
                            {tx.signature}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Transactions;
