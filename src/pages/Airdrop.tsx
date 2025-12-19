import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Users, Send, AlertCircle, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import { useAirdrop, AirdropRecipient } from "@/hooks/useAirdrop";

const airdropSchema = z.object({
  tokenAddress: z.string().min(32, "Invalid token address").max(44, "Invalid token address"),
  amount: z.number().min(0.000001, "Amount must be greater than 0"),
  addresses: z.array(z.string().min(32).max(44)).min(1, "At least one recipient required").max(100, "Maximum 100 recipients per batch"),
});

const Airdrop = () => {
  const [formData, setFormData] = useState({
    tokenAddress: "",
    amount: "",
    addresses: "",
  });
  const [results, setResults] = useState<AirdropRecipient[]>([]);
  const { toast } = useToast();
  const { connected, publicKey } = useWallet();
  const { executeAirdrop, isProcessing, progress, cancelAirdrop } = useAirdrop();

  const parseAddresses = (text: string): string[] => {
    return text
      .split(/[\n,;]/)
      .map((addr) => addr.trim())
      .filter((addr) => addr.length >= 32 && addr.length <= 44);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet using the button below",
        variant: "destructive",
      });
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

      setResults([]);

      const airdropResults = await executeAirdrop(
        formData.tokenAddress,
        amountNum,
        addressList
      );

      setResults(airdropResults);

      const successCount = airdropResults.filter(r => r.status === 'success').length;
      const failCount = airdropResults.filter(r => r.status === 'failed').length;

      if (failCount === 0) {
        toast({
          title: "Airdrop Complete!",
          description: `Successfully sent tokens to ${successCount} addresses`,
        });
      } else if (successCount > 0) {
        toast({
          title: "Airdrop Partially Complete",
          description: `${successCount} succeeded, ${failCount} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Airdrop Failed",
          description: "All transfers failed. Check your token balance and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Airdrop error:', error);
      toast({
        title: "Airdrop Failed",
        description: (error as Error).message || "Failed to process airdrop. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addressCount = parseAddresses(formData.addresses).length;
  const totalAmount = addressCount * parseFloat(formData.amount || "0");
  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const airdropStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Token Airdrop Distribution - Bulk Send Solana Tokens",
    description: "Distribute tokens to multiple wallets instantly on Solana blockchain. Efficient airdrop platform for token distribution.",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="Token Airdrop Distribution - Bulk Send Solana Tokens"
        description="Distribute tokens to multiple wallets instantly on Solana blockchain. Efficient multi-wallet airdrop platform with atomic transactions. Send tokens to hundreds of recipients at once."
        keywords="crypto airdrop, token distribution, bulk send tokens, Solana airdrop, multi-wallet send, token giveaway"
        url="/airdrop"
        structuredData={airdropStructuredData}
      />
      <AppHeader />
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
                  Distribute SPL tokens to multiple addresses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!connected && (
              <div className="space-y-3 mb-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Please connect your wallet first to perform airdrops.</AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </div>
            )}

            {connected && (
              <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Connected:</span>
                  <code className="text-xs bg-background/50 px-2 py-0.5 rounded">
                    {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-6)}
                  </code>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenAddress">Token Mint Address *</Label>
                  <Input
                    id="tokenAddress"
                    placeholder="Enter SPL token mint address..."
                    value={formData.tokenAddress}
                    onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                    disabled={isProcessing}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The mint address of the SPL token you want to distribute
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount per Recipient *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    min="0.000001"
                    placeholder="100"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    disabled={isProcessing}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount of tokens each recipient will receive
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addresses">Recipient Addresses * (max 100)</Label>
                  <Textarea
                    id="addresses"
                    placeholder="Enter Solana addresses (one per line, comma, or semicolon separated)..."
                    rows={6}
                    value={formData.addresses}
                    onChange={(e) => setFormData({ ...formData, addresses: e.target.value })}
                    disabled={isProcessing}
                    required
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {addressCount} valid recipient{addressCount !== 1 ? "s" : ""}
                    </span>
                    {totalAmount > 0 && <span>Total: {totalAmount.toLocaleString()} tokens</span>}
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              {isProcessing && (
                <div className="space-y-3 p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing batch {progress.currentBatch} of {progress.totalBatches}...
                    </span>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={cancelAirdrop}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.completed} / {progress.total} processed</span>
                    <span className="flex items-center gap-3">
                      <span className="text-green-500">{progress.successful} ✓</span>
                      <span className="text-red-500">{progress.failed} ✗</span>
                    </span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full min-h-[44px] sm:min-h-[48px] touch-manipulation" 
                size="lg"
                disabled={!connected || isProcessing || addressCount === 0}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Airdrop...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">
                      Send to {addressCount} Address{addressCount !== 1 ? "es" : ""}
                    </span>
                  </>
                )}
              </Button>
            </form>

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Results</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {results.filter(r => r.status === 'success').length}
                    </Badge>
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="w-3 h-3" />
                      {results.filter(r => r.status === 'failed').length}
                    </Badge>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2.5 rounded text-xs ${
                        result.status === 'success' 
                          ? 'bg-green-500/10 border border-green-500/20' 
                          : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <span className="font-mono truncate flex-1 mr-2">
                        {result.address.slice(0, 8)}...{result.address.slice(-6)}
                      </span>
                      <div className="flex items-center gap-2">
                        {result.signature && (
                          <a
                            href={`https://solscan.io/tx/${result.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        )}
                        <Badge 
                          variant={result.status === "success" ? "default" : "destructive"} 
                          className="gap-1"
                        >
                          {result.status === "success" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Sent
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Failed
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong>How it works:</strong> Tokens are distributed in batches of 5 recipients per transaction.
                You'll be prompted to sign each batch. Network fees are paid in SOL.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Requirements:</strong> Ensure you have sufficient token balance and SOL for transaction fees.
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
