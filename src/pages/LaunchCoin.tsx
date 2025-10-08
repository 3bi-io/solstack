import { useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, Coins, Image as ImageIcon, AlertCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SolanaSetupAlert } from "@/components/SolanaSetupAlert";
import { z } from "zod";

const tokenSchema = z.object({
  name: z.string().min(1, "Token name is required").max(32, "Name must be less than 32 characters"),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol must be less than 10 characters"),
  decimals: z.number().min(0).max(9),
  supply: z.number().min(1, "Supply must be at least 1"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

const LaunchCoin = () => {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    supply: 1000000,
    description: "",
    logoUrl: "",
  });
  const [isLaunching, setIsLaunching] = useState(false);
  const { toast } = useToast();
  const { isConnected, seedPhrase } = useWallet();
  const { openFeedback } = useFeedback();

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

    try {
      const validation = tokenSchema.safeParse(formData);
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      setIsLaunching(true);

      // Call edge function to launch token
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('launch-token', {
        body: {
          name: formData.name,
          symbol: formData.symbol,
          decimals: formData.decimals,
          supply: formData.supply,
          description: formData.description,
          logoUrl: formData.logoUrl,
          seedPhrase: seedPhrase,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to launch token');
      }

      toast({
        title: "Token Launched! 🚀",
        description: `${formData.name} (${formData.symbol}) has been successfully created on Solana.`,
      });

      // Log explorer link
      if (data.explorerUrl) {
        console.log('View token on Solana Explorer:', data.explorerUrl);
      }

      // Reset form
      setFormData({
        name: "",
        symbol: "",
        decimals: 9,
        supply: 1000000,
        description: "",
        logoUrl: "",
      });
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: error instanceof Error ? error.message : "Failed to launch token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Launch Token</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Create and deploy your SPL token on Solana
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
                    Please connect your wallet first to launch tokens.
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
              {/* Token Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Token Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Token Name *</Label>
                    <Input
                      id="name"
                      placeholder="My Token"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol *</Label>
                    <Input
                      id="symbol"
                      placeholder="MTK"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimals">Decimals</Label>
                    <Input
                      id="decimals"
                      type="number"
                      min="0"
                      max="9"
                      value={formData.decimals}
                      onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Standard is 9</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supply">Initial Supply *</Label>
                    <Input
                      id="supply"
                      type="number"
                      min="1"
                      value={formData.supply}
                      onChange={(e) => setFormData({ ...formData, supply: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your token..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Token Logo (Optional)
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://..."
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Launch Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isConnected || isLaunching}
              >
                {isLaunching ? (
                  "Launching..."
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Token on Solana
                  </>
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Your token will be created with auto-bundling features enabled. 
                Network fees will be deducted from your connected wallet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default LaunchCoin;
