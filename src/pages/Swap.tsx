import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { TokenSelector } from "@/components/TokenSelector";
import {
  Token,
  POPULAR_TOKENS,
  getJupiterQuote,
  executeJupiterSwap,
  formatTokenAmount,
  parseTokenAmount,
  QuoteResponse,
} from "@/lib/jupiter";

export default function Swap() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { toast } = useToast();

  const [inputToken, setInputToken] = useState<Token>(POPULAR_TOKENS[0]); // SOL
  const [outputToken, setOutputToken] = useState<Token>(POPULAR_TOKENS[1]); // USDC
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [slippage, setSlippage] = useState(0.5); // 0.5%

  // Fetch quote when input amount changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!inputAmount || parseFloat(inputAmount) <= 0) {
        setOutputAmount("");
        setQuote(null);
        return;
      }

      setIsLoadingQuote(true);
      try {
        const amount = parseTokenAmount(inputAmount, inputToken.decimals);
        const quoteResponse = await getJupiterQuote(
          inputToken.address,
          outputToken.address,
          amount,
          slippage * 100 // Convert to basis points
        );

        setQuote(quoteResponse);
        const outAmount = formatTokenAmount(
          quoteResponse.outAmount,
          outputToken.decimals
        );
        setOutputAmount(outAmount);
      } catch (error) {
        console.error("Error fetching quote:", error);
        setOutputAmount("");
        setQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [inputAmount, inputToken, outputToken, slippage]);

  const handleSwap = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to swap tokens",
        variant: "destructive",
      });
      return;
    }

    if (!signTransaction) {
      toast({
        title: "Wallet Error",
        description: "Wallet does not support transaction signing",
        variant: "destructive",
      });
      return;
    }

    if (!quote) {
      toast({
        title: "No Quote Available",
        description: "Please enter an amount to get a quote",
        variant: "destructive",
      });
      return;
    }

    setIsSwapping(true);

    try {
      const signature = await executeJupiterSwap(
        connection,
        publicKey,
        signTransaction,
        quote,
        (status) => {
          toast({
            title: "Swap Progress",
            description: status,
          });
        }
      );

      toast({
        title: "Swap Successful! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <span>Your swap was completed successfully!</span>
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline text-sm"
            >
              View on Solscan
            </a>
          </div>
        ),
      });

      // Reset form
      setInputAmount("");
      setOutputAmount("");
      setQuote(null);
    } catch (error: any) {
      console.error("Swap error:", error);
      toast({
        title: "Swap Failed",
        description: error?.message || "Failed to execute swap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFlipTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount("");
  };

  const priceImpact = quote?.priceImpactPct
    ? parseFloat(quote.priceImpactPct)
    : 0;
  const priceImpactColor =
    priceImpact < 1 ? "text-green-500" : priceImpact < 3 ? "text-yellow-500" : "text-red-500";

  const swapStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Solana Token Swap - Jupiter DEX Aggregator",
    description: "Swap Solana tokens with best rates via Jupiter aggregator. Access all Solana DEXs with one click.",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="Solana Token Swap - Jupiter DEX Aggregator Integration"
        description="Trade Solana tokens with the best rates across all DEXs. Powered by Jupiter aggregator for optimal routing and minimal slippage. Swap SOL, USDC, and all Solana tokens instantly."
        keywords="Solana swap, Jupiter aggregator, Solana DEX, token swap, crypto trading, DeFi swap, Solana exchange, best swap rates"
        url="/swap"
        structuredData={swapStructuredData}
      />
      <AppHeader />
      <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="space-y-2 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Swap Tokens</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Trade tokens with the best rates via Jupiter
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Badge variant="default" className="py-2.5 text-sm flex-1 justify-center">
            ⚡ Powered by Jupiter
          </Badge>
          <WalletMultiButton className="!bg-primary !h-10" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Token Swap</CardTitle>
            <CardDescription>
              Best prices across all Solana DEXs
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
                  className="flex-1"
                  disabled={isSwapping}
                />
                <TokenSelector
                  selectedToken={inputToken}
                  onSelectToken={setInputToken}
                  disabled={isSwapping}
                />
              </div>
            </div>

            {/* Swap Direction */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleFlipTokens}
                disabled={isSwapping}
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            {/* Output Token */}
            <div className="space-y-2">
              <Label htmlFor="output">You Receive (estimated)</Label>
              <div className="flex gap-2">
                <Input
                  id="output"
                  type="text"
                  placeholder="0.00"
                  value={
                    isLoadingQuote
                      ? "Loading..."
                      : outputAmount
                  }
                  className="flex-1"
                  disabled
                />
                <TokenSelector
                  selectedToken={outputToken}
                  onSelectToken={setOutputToken}
                  disabled={isSwapping}
                />
              </div>
            </div>

            {/* Swap Info */}
            {quote && (
              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">
                    1 {inputToken.symbol} ≈{" "}
                    {(
                      parseFloat(outputAmount) / parseFloat(inputAmount || "1")
                    ).toFixed(4)}{" "}
                    {outputToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={`font-medium ${priceImpactColor}`}>
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slippage</span>
                  <span className="font-medium">{slippage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-medium">~0.000005 SOL</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <Button
              className="w-full min-h-[44px] touch-manipulation"
              size="lg"
              onClick={handleSwap}
              disabled={
                !publicKey ||
                isSwapping ||
                isLoadingQuote ||
                !quote ||
                !inputAmount ||
                parseFloat(inputAmount) <= 0
              }
            >
              {isSwapping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm sm:text-base">Swapping...</span>
                </>
              ) : !publicKey ? (
                <span className="text-sm sm:text-base">Connect Wallet</span>
              ) : (
                <span className="text-sm sm:text-base">Swap Tokens</span>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Best swap rates aggregated from all Solana DEXs via Jupiter
            </p>
          </CardContent>
        </Card>

        {/* Jupiter Info */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3">
              <div className="text-3xl sm:text-4xl flex-shrink-0">⚡</div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">Why Jupiter?</h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• Best price aggregation across all DEXs</li>
                  <li>• Optimal routing for lowest fees</li>
                  <li>• Support for all Solana tokens</li>
                  <li>• Instant swaps with minimal slippage</li>
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 h-auto text-xs sm:text-sm touch-manipulation min-h-[44px]"
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
      <TelegramNavigation />
    </div>
  );
}
