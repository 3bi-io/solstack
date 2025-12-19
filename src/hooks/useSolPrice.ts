import { useState, useEffect, useCallback } from 'react';
import { 
  COINGECKO_API_BASE, 
  COINGECKO_CACHE_DURATION, 
  COINGECKO_REFRESH_INTERVAL 
} from '@/config/solana';
import type { PriceCache } from '@/types/price';

interface UseSolPriceReturn {
  solPrice: number | null;
  sol24hChange: number | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// Module-level cache to avoid rate limiting
let priceCache: PriceCache = { sol: null, sol24hChange: null, timestamp: 0 };

export function useSolPrice(): UseSolPriceReturn {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [sol24hChange, setSol24hChange] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (priceCache.sol !== null && now - priceCache.timestamp < COINGECKO_CACHE_DURATION) {
      setSolPrice(priceCache.sol);
      setSol24hChange(priceCache.sol24hChange);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limited - using cached price');
        }
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();

      if (data.solana?.usd) {
        const price = data.solana.usd;
        const change24h = data.solana.usd_24h_change ?? null;
        setSolPrice(price);
        setSol24hChange(change24h);
        priceCache = { sol: price, sol24hChange: change24h, timestamp: now };
      }
    } catch (err) {
      console.error('CoinGecko price fetch error:', err);
      setError((err as Error).message);

      // Use cached price if available
      if (priceCache.sol !== null) {
        setSolPrice(priceCache.sol);
        setSol24hChange(priceCache.sol24hChange);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();

    // Refresh at configured interval
    const interval = setInterval(fetchPrice, COINGECKO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return {
    solPrice,
    sol24hChange,
    isLoading,
    error,
    refresh: fetchPrice,
  };
}
