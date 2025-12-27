import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDownUp, 
  Wallet, 
  RefreshCw, 
  Zap, 
  Info,
  ArrowRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOptimizedSolPrice } from "@/hooks/useOptimizedSolPrice";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  chain: string;
  balance: number;
}

const TOKENS: Record<string, Token> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    chain: "Solana",
    balance: 12.5,
  },
  GEN1: {
    symbol: "GEN1",
    name: "Genesis One",
    icon: "◆",
    chain: "Genesis One",
    balance: 0,
  },
};

// Mock exchange rate
const EXCHANGE_RATE = 1.05; // 1 SOL = 1.05 GEN1

export const BridgeSwapInterface = () => {
  const [fromToken, setFromToken] = useState<Token>(TOKENS.SOL);
  const [toToken, setToToken] = useState<Token>(TOKENS.GEN1);
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const { solPrice } = useOptimizedSolPrice();

  const outputAmount = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return "0";
    const input = parseFloat(amount);
    if (fromToken.symbol === "SOL") {
      return (input * EXCHANGE_RATE).toFixed(6);
    }
    return (input / EXCHANGE_RATE).toFixed(6);
  }, [amount, fromToken.symbol]);

  const usdValue = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    return parseFloat(amount) * (solPrice || 0);
  }, [amount, solPrice]);

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount("");
  };

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to bridge",
        variant: "destructive",
      });
      return;
    }

    setIsSwapping(true);
    
    // Simulate bridge transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Bridge Initiated",
      description: `Bridging ${amount} ${fromToken.symbol} to ${outputAmount} ${toToken.symbol}`,
    });
    
    setIsSwapping(false);
    setAmount("");
  };

  const handleMaxAmount = () => {
    setAmount(fromToken.balance.toString());
  };

  return (
    <Card className="relative overflow-hidden border-accent/20 bg-gradient-to-br from-card via-card to-accent/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 font-mono">
            <Zap className="w-5 h-5 text-accent" />
            Bridge Assets
          </CardTitle>
          <Badge variant="outline" className="gap-1 text-xs">
            <Info className="w-3 h-3" />
            Rate: 1 SOL = {EXCHANGE_RATE} GEN1
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">From ({fromToken.chain})</span>
            <span className="text-xs text-muted-foreground">
              Balance: {fromToken.balance.toFixed(4)} {fromToken.symbol}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <span className="text-2xl">{fromToken.icon}</span>
              <span className="font-semibold">{fromToken.symbol}</span>
            </div>
            
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none text-right h-12 focus-visible:ring-0"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              ≈ ${usdValue.toFixed(2)} USD
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMaxAmount}
              className="text-xs text-accent hover:text-accent"
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapDirection}
            className="rounded-full border-2 border-accent/50 bg-background hover:bg-accent/10 hover:border-accent"
          >
            <ArrowDownUp className="w-4 h-4 text-accent" />
          </Button>
        </div>

        {/* To Token */}
        <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">To ({toToken.chain})</span>
            <span className="text-xs text-muted-foreground">
              Balance: {toToken.balance.toFixed(4)} {toToken.symbol}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <span className="text-2xl">{toToken.icon}</span>
              <span className="font-semibold">{toToken.symbol}</span>
            </div>
            
            <div className="flex-1">
              <div className="text-2xl font-bold text-right h-12 flex items-center justify-end text-muted-foreground">
                {outputAmount}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              You will receive
            </span>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              {outputAmount} {toToken.symbol}
            </span>
          </div>
        </div>

        {/* Bridge Details */}
        <div className="p-3 rounded-lg bg-muted/30 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span>1 {fromToken.symbol} = {fromToken.symbol === "SOL" ? EXCHANGE_RATE : (1/EXCHANGE_RATE).toFixed(4)} {toToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bridge Fee</span>
            <span className="text-green-500">0.1%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated Time</span>
            <span>~30 seconds</span>
          </div>
        </div>

        {/* Bridge Button */}
        <Button
          onClick={handleBridge}
          disabled={isSwapping || !amount || parseFloat(amount) <= 0}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Bridging...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Bridge {fromToken.symbol} → {toToken.symbol}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By bridging, you agree to the terms of the Genesis Bridge protocol.
        </p>
      </CardContent>
    </Card>
  );
};
