import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTopTradingPairs, calculatePriceChange, getTokenLogoUrl } from '@/lib/okx';
import { queryKeys, staleTimes } from './useApiQuery';

export interface MarketToken {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  source: 'okx';
  rank?: number;
}

interface MarketDataResult {
  tokens: MarketToken[];
  okxCount: number;
}

/**
 * React Query-powered market data hook with caching
 */
export function useOptimizedMarketData() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.marketData(),
    queryFn: async (): Promise<MarketDataResult> => {
      const okxData = await getTopTradingPairs(50);

      const okxTokens: MarketToken[] = okxData.map((pair: any, index: number) => {
        const symbol = pair.baseCcy || pair.instId.split("-")[0];
        return {
          id: pair.instId,
          name: pair.instId,
          symbol: symbol,
          image: getTokenLogoUrl(symbol),
          price: pair.ticker ? parseFloat(pair.ticker.last) : 0,
          change24h: pair.ticker ? calculatePriceChange(pair.ticker.last, pair.ticker.open24h) : 0,
          volume24h: pair.ticker ? parseFloat(pair.ticker.vol24h) : 0,
          source: 'okx' as const,
          rank: index + 1,
        };
      });

      return {
        tokens: okxTokens,
        okxCount: okxTokens.length,
      };
    },
    staleTime: staleTimes.market,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.marketData() });
  };

  return {
    tokens: query.data?.tokens ?? [],
    okxCount: query.data?.okxCount ?? 0,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error?.message ?? null,
    refresh,
  };
}
