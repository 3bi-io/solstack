import { useState, useCallback } from 'react';
import { getJupiterQuote, QuoteResponse } from '@/lib/jupiter';

interface UseJupiterQuoteReturn {
  quote: QuoteResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchQuote: (inputMint: string, outputMint: string, amount: number, slippageBps?: number) => Promise<QuoteResponse | null>;
  clearQuote: () => void;
}

export const useJupiterQuote = (): UseJupiterQuoteReturn => {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async (
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<QuoteResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const quoteResponse = await getJupiterQuote(inputMint, outputMint, amount, slippageBps);
      setQuote(quoteResponse);
      return quoteResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
      setError(errorMessage);
      console.error('Jupiter quote error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearQuote = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return {
    quote,
    isLoading,
    error,
    fetchQuote,
    clearQuote
  };
};
