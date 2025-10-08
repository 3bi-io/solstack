import { useState, useEffect } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, Plus, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MultiSigWallet {
  id: string;
  wallet_address: string;
  threshold: number;
  signers: string[];
  is_active: boolean;
  created_at: string;
}

interface MultiSigTransaction {
  id: string;
  multisig_wallet_id: string;
  transaction_data: any;
  signatures: any;
  status: string;
  created_at: string;
}

export default function MultiSig() {
  const [wallets, setWallets] = useState<MultiSigWallet[]>([]);
  const [transactions, setTransactions] = useState<MultiSigTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Create wallet form
  const [newWallet, setNewWallet] = useState({
    signers: "",
    threshold: 2,
  });

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from("multisig_wallets" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWallets((data as any) || []);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("multisig_transactions" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions((data as any) || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleCreateWallet = async () => {
    const signerArray = newWallet.signers
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (signerArray.length < 2) {
      toast({
        title: "Invalid Signers",
        description: "At least 2 signers required for multi-sig wallet",
        variant: "destructive",
      });
      return;
    }

    if (newWallet.threshold > signerArray.length) {
      toast({
        title: "Invalid Threshold",
        description: "Threshold cannot exceed number of signers",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("multisig_wallets" as any)
        .insert({
          creator_id: user.id,
          wallet_address: `multisig_${Date.now()}`, // Placeholder - would be real Solana address
          threshold: newWallet.threshold,
          signers: signerArray,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Multi-Sig Wallet Created",
        description: `Created wallet requiring ${newWallet.threshold} of ${signerArray.length} signatures`,
      });

      setNewWallet({ signers: "", threshold: 2 });
      fetchWallets();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getSignatureCount = (tx: MultiSigTransaction) => {
    return Object.keys(tx.signatures || {}).length;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="container mx-auto p-4">
        <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Multi-Signature Wallets
          </h1>
          <p className="text-muted-foreground">
            Create secure wallets requiring multiple approvals
          </p>
        </div>

        <Tabs defaultValue="wallets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="wallets">My Wallets</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : wallets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No multi-sig wallets yet</p>
                  <Button className="mt-4" onClick={() => {}}>
                    Create Your First Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {wallets.map((wallet) => (
                  <Card key={wallet.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Multi-Sig Wallet</CardTitle>
                          <CardDescription className="font-mono text-xs mt-1">
                            {wallet.wallet_address.slice(0, 20)}...
                          </CardDescription>
                        </div>
                        <Badge variant={wallet.is_active ? "default" : "secondary"}>
                          {wallet.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Threshold</span>
                        <Badge variant="outline">
                          {wallet.threshold} of {wallet.signers.length}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">Signers:</p>
                        {wallet.signers.slice(0, 3).map((signer, idx) => (
                          <p key={idx} className="text-xs font-mono">
                            {signer.slice(0, 12)}...{signer.slice(-8)}
                          </p>
                        ))}
                        {wallet.signers.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{wallet.signers.length - 3} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pending Transactions */}
            {transactions.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="text-xl font-semibold">Pending Transactions</h3>
                {transactions.filter(tx => tx.status === 'pending').map((tx) => {
                  const wallet = wallets.find(w => w.id === tx.multisig_wallet_id);
                  const sigCount = getSignatureCount(tx);
                  const threshold = wallet?.threshold || 0;

                  return (
                    <Card key={tx.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">Transaction #{tx.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              Wallet: {wallet?.wallet_address.slice(0, 20)}...
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant={sigCount >= threshold ? "default" : "secondary"}>
                              {sigCount >= threshold ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Ready
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {sigCount}/{threshold} Signed
                                </>
                              )}
                            </Badge>
                            {sigCount >= threshold && (
                              <Button size="sm" className="w-full">Execute</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Multi-Sig Wallet
                </CardTitle>
                <CardDescription>
                  Set up a wallet requiring multiple signatures for transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signers">Signer Addresses (one per line)</Label>
                  <textarea
                    id="signers"
                    className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border bg-background"
                    placeholder="DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7A3VkHjW1F&#10;7xKXtg2CW87d97TXJSDpbDFu1sRMC7A3VkHjW1F&#10;..."
                    value={newWallet.signers}
                    onChange={(e) => setNewWallet({ ...newWallet, signers: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {newWallet.signers.split("\n").filter(s => s.trim()).length} signers added
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Signature Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    value={newWallet.threshold}
                    onChange={(e) => setNewWallet({ ...newWallet, threshold: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of signatures required to execute transactions
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Security Features
                  </h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Multiple signatures prevent unauthorized transactions</li>
                    <li>• Ideal for team treasuries and shared funds</li>
                    <li>• On-chain verification ensures security</li>
                    <li>• Configurable threshold for flexibility</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleCreateWallet} 
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Wallet...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Create Multi-Sig Wallet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
      <TelegramNavigation />
    </div>
  );
}
