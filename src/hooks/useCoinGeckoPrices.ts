/**
 * @deprecated Use useSolPrice from '@/hooks/useSolPrice' instead.
 * This file is kept for backward compatibility but delegates to the new implementation.
 */

import { useSolPrice } from './useSolPrice';
import type { TokenPrice } from '@/types/price';
export { formatUsd } from '@/lib/utils';
export type { TokenPrice };

interface UseCoinGeckoPricesReturn {
  solPrice: number | null;
  sol24hChange: number | null;
  tokenPrices: Map<string, TokenPrice>;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * @deprecated Use useSolPrice hook directly
 */
export function useCoinGeckoPrices(): UseCoinGeckoPricesReturn {
  const { solPrice, sol24hChange, isLoading, error, refresh } = useSolPrice();
  
  return {
    solPrice,
    sol24hChange,
    tokenPrices: new Map(), // Legacy - not used
    isLoading,
    error,
    refresh,
  };
}
