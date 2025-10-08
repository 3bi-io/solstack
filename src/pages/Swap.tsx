import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Swap() {
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSwap = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Jupiter Terminal integration - would open Jupiter widget
      // In production, integrate Jupiter Terminal or API
      toast({
        title: "Swap Initiated",
        description: "Opening Jupiter swap interface...",
      });
      
      // Simulate Jupiter integration
      setTimeout(() => {
        setOutputAmount((parseFloat(inputAmount) * 155).toString()); // Mock rate
        toast({
          title: "Rate Quote",
          description: `Current rate: 1 SOL ≈ ${(parseFloat(inputAmount) * 155).toFixed(2)} USDC`,
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Swap Tokens</h1>
          <p className="text-muted-foreground">
            Trade tokens with the best rates via Jupiter
          </p>
        </div>

        <Badge variant="default" className="w-full justify-center py-2">
          ⚡ Powered by Jupiter Aggregator
        </Badge>

        <Card>
          <CardHeader>
            <CardTitle>Token Swap</CardTitle>
            <CardDescription>
              Powered by Jupiter Aggregator for best prices
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Input Token */}
            <div className="space-y-2">
              <Label htmlFor="input">You Pay</Label>
              <div className="flex gap-2">
                <Input
                  id="input"
                  type="number"
                  placeholder="0.00"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                />
                <Button variant="outline" disabled>
                  SOL
                </Button>
              </div>
            </div>

            {/* Swap Direction */}
            <div className="flex justify-center">
              <Button variant="ghost" size="icon" className="rounded-full" disabled>
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            {/* Output Token */}
            <div className="space-y-2">
              <Label htmlFor="output">You Receive</Label>
              <div className="flex gap-2">
                <Input
                  id="output"
                  type="number"
                  placeholder="0.00"
                  value={outputAmount}
                  onChange={(e) => setOutputAmount(e.target.value)}
                  disabled
                />
                <Button variant="outline" disabled>
                  USDC
                </Button>
              </div>
            </div>

            {/* Swap Info */}
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">1 SOL = ~XX USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className="text-green-500 font-medium">&lt; 0.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-medium">~0.001 SOL</span>
              </div>
            </div>

            {/* Swap Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSwap}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Swapping...
                </>
              ) : (
                "Swap Tokens"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Best swap rates aggregated from all Solana DEXs via Jupiter
            </p>
          </CardContent>
        </Card>

        {/* Jupiter Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-4xl">⚡</div>
              <div className="space-y-1">
                <h3 className="font-semibold">Why Jupiter?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Best price aggregation across all DEXs</li>
                  <li>• Optimal routing for lowest fees</li>
                  <li>• Support for all Solana tokens</li>
                  <li>• Instant swaps with minimal slippage</li>
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                  onClick={() => window.open("https://jup.ag", "_blank")}
                >
                  Learn more about Jupiter
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
