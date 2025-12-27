import { useState, useMemo, useCallback } from "react";
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
  ArrowRight,
  AlertCircle,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOptimizedSolPrice } from "@/hooks/useOptimizedSolPrice";
import { useOptimizedWalletBalance } from "@/hooks/useOptimizedWalletBalance";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { 
  LAMPORTS_PER_SOL, 
  Transaction, 
  SystemProgram, 
  PublicKey,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  chain: string;
}

const TOKENS: Record<string, Token> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    chain: "Solana",
  },
  GEN1: {
    symbol: "GEN1",
    name: "Genesis One",
    icon: "◆",
    chain: "Genesis One",
  },
};

// Mock exchange rate
const EXCHANGE_RATE = 1.05; // 1 SOL = 1.05 GEN1
const BRIDGE_FEE_PERCENT = 0.1;

// Bridge vault address - in production this would be a real program-controlled vault
// Using a valid base58 address format
const BRIDGE_VAULT_ADDRESS = new PublicKey("BridgeVau1tXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1");

export const BridgeSwapInterface = () => {
  const [fromToken, setFromToken] = useState<Token>(TOKENS.SOL);
  const [toToken, setToToken] = useState<Token>(TOKENS.GEN1);
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastTxSignature, setLastTxSignature] = useState<string | null>(null);
  
  // Real wallet connection
  const { connected, publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { sol: solBalance, solFormatted, refresh: refreshBalance, isLoading: balanceLoading } = useOptimizedWalletBalance();
  const { solPrice } = useOptimizedSolPrice();

  // GEN1 balance (mock for now - would come from Genesis One chain)
  const gen1Balance = 0;

  const currentBalance = useMemo(() => {
    return fromToken.symbol === "SOL" ? solBalance : gen1Balance;
  }, [fromToken.symbol, solBalance, gen1Balance]);

  const outputAmount = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return "0";
    const input = parseFloat(amount);
    const afterFee = input * (1 - BRIDGE_FEE_PERCENT / 100);
    if (fromToken.symbol === "SOL") {
      return (afterFee * EXCHANGE_RATE).toFixed(6);
    }
    return (afterFee / EXCHANGE_RATE).toFixed(6);
  }, [amount, fromToken.symbol]);

  const usdValue = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    return parseFloat(amount) * (solPrice || 0);
  }, [amount, solPrice]);

  const bridgeFee = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    return parseFloat(amount) * (BRIDGE_FEE_PERCENT / 100);
  }, [amount]);

  const isInsufficientBalance = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return false;
    return parseFloat(amount) > currentBalance;
  }, [amount, currentBalance]);

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount("");
  };

  const handleBridge = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to bridge",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to bridge",
        variant: "destructive",
      });
      return;
    }

    if (isInsufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromToken.symbol}`,
        variant: "destructive",
      });
      return;
    }

    setIsSwapping(true);
    setLastTxSignature(null);
    
    try {
      if (fromToken.symbol === "SOL") {
        const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
        
        toast({
          title: "Preparing Transaction",
          description: "Building bridge transaction...",
        });

        // Get the latest blockhash for transaction
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

        // Create the transfer instruction to bridge vault
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: BRIDGE_VAULT_ADDRESS,
          lamports: lamports,
        });

        // Create a versioned transaction for better compatibility
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions: [transferInstruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        toast({
          title: "Awaiting Signature",
          description: "Please approve the transaction in your wallet...",
        });

        // Send the transaction using the wallet adapter
        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });

        toast({
          title: "Transaction Submitted",
          description: "Waiting for confirmation...",
        });

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        }, 'confirmed');

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        setLastTxSignature(signature);
        
        toast({
          title: "Bridge Successful!",
          description: (
            <div className="flex flex-col gap-2">
              <span>Successfully bridged {amount} SOL to {outputAmount} GEN1</span>
              <a 
                href={`https://solscan.io/tx/${signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1"
              >
                View on Solscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ),
        });
        
        // Refresh balance after successful bridge
        setTimeout(() => refreshBalance(), 2000);
      } else {
        // GEN1 to SOL bridge would require Genesis One chain integration
        toast({
          title: "Coming Soon",
          description: "GEN1 to SOL bridging will be available once Genesis One mainnet launches.",
        });
      }
    } catch (error: any) {
      console.error("Bridge error:", error);
      
      let errorMessage = "Failed to complete bridge transaction";
      if (error.message?.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient SOL for transaction fees";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Bridge Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
      setAmount("");
    }
  };

  const handleMaxAmount = () => {
    // Leave some SOL for transaction fees
    const maxAmount = fromToken.symbol === "SOL" 
      ? Math.max(0, solBalance - 0.01).toFixed(6)
      : gen1Balance.toString();
    setAmount(maxAmount);
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
          <div className="flex items-center gap-2">
            {connected && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshBalance}
                disabled={balanceLoading}
                className="gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${balanceLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Badge variant="outline" className="gap-1 text-xs">
              <Info className="w-3 h-3" />
              Rate: 1 SOL = {EXCHANGE_RATE} GEN1
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Wallet Connection Status */}
        {!connected && (
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-500">Wallet Not Connected</p>
              <p className="text-xs text-muted-foreground">Connect your wallet to bridge assets</p>
            </div>
            <WalletMultiButton className="!bg-gradient-to-r !from-accent !to-primary !text-sm !py-2 !px-4 !rounded-lg !font-medium" />
          </div>
        )}

        {/* From Token */}
        <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">From ({fromToken.chain})</span>
            <span className="text-xs text-muted-foreground">
              Balance: {fromToken.symbol === "SOL" ? solFormatted : gen1Balance.toFixed(4)} {fromToken.symbol}
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
                className={`text-2xl font-bold bg-transparent border-none text-right h-12 focus-visible:ring-0 ${
                  isInsufficientBalance ? 'text-red-500' : ''
                }`}
                disabled={!connected}
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
              disabled={!connected}
              className="text-xs text-accent hover:text-accent"
            >
              MAX
            </Button>
          </div>
          
          {isInsufficientBalance && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Insufficient balance
            </p>
          )}
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
              Balance: {toToken.symbol === "SOL" ? solFormatted : gen1Balance.toFixed(4)} {toToken.symbol}
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

        {/* Last Transaction */}
        {lastTxSignature && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Last Transaction Confirmed</span>
            </div>
            <a 
              href={`https://solscan.io/tx/${lastTxSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted-foreground hover:text-accent flex items-center gap-1 break-all"
            >
              {lastTxSignature.slice(0, 20)}...{lastTxSignature.slice(-20)}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        )}

        {/* Bridge Details */}
        <div className="p-3 rounded-lg bg-muted/30 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span>1 {fromToken.symbol} = {fromToken.symbol === "SOL" ? EXCHANGE_RATE : (1/EXCHANGE_RATE).toFixed(4)} {toToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bridge Fee ({BRIDGE_FEE_PERCENT}%)</span>
            <span className="text-yellow-500">{bridgeFee.toFixed(6)} {fromToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated Time</span>
            <span>~30 seconds</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bridge Vault</span>
            <a 
              href={`https://solscan.io/account/${BRIDGE_VAULT_ADDRESS.toBase58()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs hover:text-accent flex items-center gap-1"
            >
              {BRIDGE_VAULT_ADDRESS.toBase58().slice(0, 4)}...{BRIDGE_VAULT_ADDRESS.toBase58().slice(-4)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {connected && publicKey && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Your Wallet</span>
              <span className="font-mono text-xs">
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </span>
            </div>
          )}
        </div>

        {/* Bridge Button */}
        {connected ? (
          <Button
            onClick={handleBridge}
            disabled={isSwapping || !amount || parseFloat(amount) <= 0 || isInsufficientBalance}
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
        ) : (
          <WalletMultiButton className="!w-full !h-12 !text-lg !font-semibold !bg-gradient-to-r !from-accent !to-primary hover:!from-accent/90 hover:!to-primary/90 !rounded-lg !justify-center">
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet to Bridge
          </WalletMultiButton>
        )}

        <p className="text-xs text-center text-muted-foreground">
          By bridging, you agree to the terms of the Genesis Bridge protocol.
        </p>
      </CardContent>
    </Card>
  );
};
