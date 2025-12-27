import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { 
  getJupiterQuote, 
  getJupiterSwapTransaction, 
  QuoteResponse,
  POPULAR_TOKENS,
  parseTokenAmount 
} from '@/lib/jupiter';
import { toast } from '@/hooks/use-toast';

interface SwapResult {
  success: boolean;
  txId?: string;
  error?: string;
}

interface RebalanceSwap {
  fromToken: string;
  fromMint: string;
  toToken: string;
  toMint: string;
  amountUsd: number;
  amountIn: number;
  quote?: QuoteResponse;
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Get mint address from symbol
const getMintFromSymbol = (symbol: string): string | null => {
  const token = POPULAR_TOKENS.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
  return token?.address || null;
};

// Get decimals from symbol
const getDecimalsFromSymbol = (symbol: string): number => {
  const token = POPULAR_TOKENS.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
  return token?.decimals || 9;
};

export const useJupiterRebalance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Get quote for a single swap
  const getSwapQuote = useCallback(async (
    fromSymbol: string,
    toSymbol: string,
    amount: number,
    slippageBps: number = 100
  ): Promise<QuoteResponse | null> => {
    const fromMint = getMintFromSymbol(fromSymbol) || fromSymbol;
    const toMint = getMintFromSymbol(toSymbol) || toSymbol;
    const decimals = getDecimalsFromSymbol(fromSymbol);
    const amountInLamports = parseTokenAmount(amount.toString(), decimals);

    try {
      const quote = await getJupiterQuote(fromMint, toMint, amountInLamports, slippageBps);
      return quote;
    } catch (error) {
      console.error('Failed to get quote:', error);
      return null;
    }
  }, []);

  // Execute a single swap
  const executeSwap = useCallback(async (
    quote: QuoteResponse,
    onProgress?: (status: string) => void
  ): Promise<SwapResult> => {
    if (!publicKey || !signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      onProgress?.('Getting swap transaction...');
      setCurrentStep('Getting swap transaction...');

      const { swapTransaction } = await getJupiterSwapTransaction({
        quoteResponse: quote,
        userPublicKey: publicKey.toString(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: 1000000,
      });

      onProgress?.('Please sign the transaction...');
      setCurrentStep('Awaiting signature...');

      // Deserialize and sign
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      const signedTransaction = await signTransaction(transaction);

      onProgress?.('Sending transaction...');
      setCurrentStep('Sending transaction...');

      // Send transaction
      const rawTransaction = signedTransaction.serialize();
      const txId = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      onProgress?.('Confirming transaction...');
      setCurrentStep('Confirming...');

      // Confirm
      await connection.confirmTransaction(txId, 'confirmed');

      onProgress?.('Swap completed!');
      setCurrentStep('');

      return { success: true, txId };
    } catch (error: any) {
      const errorMessage = error.message?.includes('User rejected')
        ? 'Transaction rejected by user'
        : error.message || 'Swap failed';
      
      setCurrentStep('');
      return { success: false, error: errorMessage };
    }
  }, [publicKey, signTransaction, connection]);

  // Execute multiple rebalancing swaps
  const executeRebalanceSwaps = useCallback(async (
    trades: Array<{
      token_symbol: string;
      action: 'buy' | 'sell';
      amount_usd: number;
    }>,
    solPrice: number,
    onProgress?: (status: string, progress: number) => void
  ): Promise<{ completed: number; failed: number; txIds: string[] }> => {
    if (!publicKey) {
      toast({ title: "Please connect your wallet", variant: "destructive" });
      return { completed: 0, failed: 0, txIds: [] };
    }

    setIsLoading(true);
    const results = { completed: 0, failed: 0, txIds: [] as string[] };

    try {
      for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        const progress = ((i + 1) / trades.length) * 100;
        
        onProgress?.(`Processing ${trade.action} ${trade.token_symbol} (${i + 1}/${trades.length})`, progress);
        setCurrentStep(`${trade.action.toUpperCase()} ${trade.token_symbol}`);

        // Determine swap direction
        // For sells: token -> USDC (or SOL)
        // For buys: SOL (or USDC) -> token
        let fromSymbol: string;
        let toSymbol: string;
        let amount: number;

        if (trade.action === 'sell') {
          fromSymbol = trade.token_symbol;
          toSymbol = 'USDC';
          // Convert USD amount to token amount (rough estimate)
          amount = trade.token_symbol === 'SOL' 
            ? trade.amount_usd / solPrice 
            : trade.amount_usd; // For other tokens, we'd need their price
        } else {
          fromSymbol = 'USDC';
          toSymbol = trade.token_symbol;
          amount = trade.amount_usd;
        }

        // Get quote
        const quote = await getSwapQuote(fromSymbol, toSymbol, amount);
        
        if (!quote) {
          console.error(`Failed to get quote for ${fromSymbol} -> ${toSymbol}`);
          results.failed++;
          continue;
        }

        // Execute swap
        const swapResult = await executeSwap(quote, (status) => {
          onProgress?.(`${trade.token_symbol}: ${status}`, progress);
        });

        if (swapResult.success && swapResult.txId) {
          results.completed++;
          results.txIds.push(swapResult.txId);
          toast({
            title: `${trade.action === 'buy' ? 'Bought' : 'Sold'} ${trade.token_symbol}`,
            description: `Transaction: ${swapResult.txId.slice(0, 8)}...`,
          });
        } else {
          results.failed++;
          toast({
            title: `Failed to ${trade.action} ${trade.token_symbol}`,
            description: swapResult.error,
            variant: "destructive",
          });
        }

        // Small delay between swaps
        if (i < trades.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } catch (error: any) {
      console.error('Rebalance swaps error:', error);
      toast({ 
        title: "Rebalancing failed", 
        description: error.message, 
        variant: "destructive" 
      });
      return results;
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  }, [publicKey, getSwapQuote, executeSwap]);

  // Get quotes for all trades (preview)
  const getRebalanceQuotes = useCallback(async (
    trades: Array<{
      token_symbol: string;
      action: 'buy' | 'sell';
      amount_usd: number;
    }>,
    solPrice: number
  ): Promise<Array<{ trade: typeof trades[0]; quote: QuoteResponse | null }>> => {
    const quotes = [];

    for (const trade of trades) {
      let fromSymbol: string;
      let toSymbol: string;
      let amount: number;

      if (trade.action === 'sell') {
        fromSymbol = trade.token_symbol;
        toSymbol = 'USDC';
        amount = trade.token_symbol === 'SOL' 
          ? trade.amount_usd / solPrice 
          : trade.amount_usd;
      } else {
        fromSymbol = 'USDC';
        toSymbol = trade.token_symbol;
        amount = trade.amount_usd;
      }

      const quote = await getSwapQuote(fromSymbol, toSymbol, amount);
      quotes.push({ trade, quote });
    }

    return quotes;
  }, [getSwapQuote]);

  return {
    isLoading,
    currentStep,
    getSwapQuote,
    executeSwap,
    executeRebalanceSwaps,
    getRebalanceQuotes,
  };
};
