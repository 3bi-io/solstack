import { useQuery, useQueryClient } from '@tanstack/react-query';
import { staleTimes } from './useApiQuery';

interface JupiterPriceData {
  id: string;
  type: string;
  price: string;
  extraInfo?: {
    quotedPrice?: {
      buyPrice?: string;
      sellPrice?: string;
    };
    confidenceLevel?: string;
    depth?: {
      buyPriceImpactRatio?: Record<string, number>;
      sellPriceImpactRatio?: Record<string, number>;
    };
  };
}

interface JupiterPriceResponse {
  data: Record<string, JupiterPriceData>;
  timeTaken: number;
}

export interface TokenPriceInfo {
  mint: string;
  priceUsd: number;
  confidence: string;
}

const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2';

// Well-known token mints for reference
export const KNOWN_TOKENS: Record<string, { symbol: string; name: string }> = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana' },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD' },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade Staked SOL' },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk' },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', name: 'Jupiter' },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { symbol: 'WETH', name: 'Wrapped Ethereum' },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': { symbol: 'bSOL', name: 'BlazeStake Staked SOL' },
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': { symbol: 'RNDR', name: 'Render Token' },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': { symbol: 'PYTH', name: 'Pyth Network' },
};

/**
 * Fetch token prices from Jupiter Price API
 */
async function fetchTokenPrices(mints: string[]): Promise<Map<string, TokenPriceInfo>> {
  if (mints.length === 0) {
    return new Map();
  }

  // Jupiter API accepts up to 100 tokens per request
  const batchSize = 100;
  const batches = [];
  for (let i = 0; i < mints.length; i += batchSize) {
    batches.push(mints.slice(i, i + batchSize));
  }

  const priceMap = new Map<string, TokenPriceInfo>();

  for (const batch of batches) {
    try {
      const params = new URLSearchParams();
      batch.forEach(mint => params.append('ids', mint));
      params.append('showExtraInfo', 'true');

      const response = await fetch(`${JUPITER_PRICE_API}?${params.toString()}`);
      
      if (!response.ok) {
        console.warn('Jupiter Price API error:', response.status);
        continue;
      }

      const data: JupiterPriceResponse = await response.json();

      for (const [mint, priceData] of Object.entries(data.data)) {
        if (priceData && priceData.price) {
          priceMap.set(mint, {
            mint,
            priceUsd: parseFloat(priceData.price),
            confidence: priceData.extraInfo?.confidenceLevel || 'unknown',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }
  }

  return priceMap;
}

/**
 * Hook to fetch real-time token prices from Jupiter
 */
export function useTokenPrices(mints: string[]) {
  const queryClient = useQueryClient();

  // Filter out empty/invalid mints and dedupe
  const validMints = [...new Set(mints.filter(m => m && m.length > 0))];

  const query = useQuery({
    queryKey: ['token-prices', validMints.sort().join(',')],
    queryFn: () => fetchTokenPrices(validMints),
    enabled: validMints.length > 0,
    staleTime: staleTimes.market, // Use market stale time (30s)
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['token-prices'] });
  };

  const getPrice = (mint: string): number | null => {
    const priceInfo = query.data?.get(mint);
    return priceInfo?.priceUsd ?? null;
  };

  const getTokenInfo = (mint: string) => {
    return KNOWN_TOKENS[mint] || null;
  };

  return {
    prices: query.data ?? new Map<string, TokenPriceInfo>(),
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    getPrice,
    getTokenInfo,
    refresh,
  };
}

/**
 * Get token symbol from known tokens or generate short form
 */
export function getTokenSymbol(mint: string): string {
  const known = KNOWN_TOKENS[mint];
  if (known) return known.symbol;
  return mint.slice(0, 4) + '...' + mint.slice(-4);
}

/**
 * Get token name from known tokens or return mint address
 */
export function getTokenName(mint: string): string {
  const known = KNOWN_TOKENS[mint];
  if (known) return known.name;
  return mint.slice(0, 8) + '...';
}
