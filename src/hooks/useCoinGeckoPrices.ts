import { useState, useEffect, useCallback } from 'react';

export interface TokenPrice {
  id: string;
  symbol: string;
  usd: number;
  usd_24h_change?: number;
}

interface UseCoinGeckoPricesReturn {
  solPrice: number | null;
  sol24hChange: number | null;
  tokenPrices: Map<string, TokenPrice>;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Cache to avoid rate limiting
let priceCache: { sol: number | null; sol24hChange: number | null; timestamp: number } = { sol: null, sol24hChange: null, timestamp: 0 };
const CACHE_DURATION = 60000; // 1 minute

export function useCoinGeckoPrices(): UseCoinGeckoPricesReturn {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [sol24hChange, setSol24hChange] = useState<number | null>(null);
  const [tokenPrices] = useState<Map<string, TokenPrice>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (priceCache.sol !== null && now - priceCache.timestamp < CACHE_DURATION) {
      setSolPrice(priceCache.sol);
      setSol24hChange(priceCache.sol24hChange);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch SOL price
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
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
    fetchPrices();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchPrices, 120000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    solPrice,
    sol24hChange,
    tokenPrices,
    isLoading,
    error,
    refresh: fetchPrices,
  };
}

// Utility to format USD
export function formatUsd(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  if (value >= 0.01) {
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toFixed(4)}`;
}
