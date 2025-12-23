import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  COINGECKO_API_BASE, 
  COINGECKO_CACHE_DURATION, 
} from '@/config/solana';
import { queryKeys, staleTimes } from './useApiQuery';

interface SolPriceData {
  solPrice: number | null;
  sol24hChange: number | null;
}

/**
 * React Query-powered SOL price hook with intelligent caching
 */
export function useOptimizedSolPrice() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.solPrice(),
    queryFn: async (): Promise<SolPriceData> => {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limited');
        }
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();

      if (data.solana?.usd) {
        return {
          solPrice: data.solana.usd,
          sol24hChange: data.solana.usd_24h_change ?? null,
        };
      }

      return { solPrice: null, sol24hChange: null };
    },
    staleTime: staleTimes.price,
    gcTime: COINGECKO_CACHE_DURATION,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: false, // Avoid rate limiting
    retry: 2,
    retryDelay: 5000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.solPrice() });
  };

  return {
    solPrice: query.data?.solPrice ?? null,
    sol24hChange: query.data?.sol24hChange ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh,
  };
}
