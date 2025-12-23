import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { parseError, showErrorToast, retryWithBackoff } from '@/lib/api-error';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced query hook with error handling and retry logic
 */
export function useApiQuery<TData, TError = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await retryWithBackoff(queryFn);
      } catch (error) {
        const parsed = parseError(error);
        throw parsed;
      }
    },
    ...options,
  });
}

/**
 * Enhanced mutation hook with error handling
 */
export function useApiMutation<TData, TVariables = void, TError = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        showErrorToast(error);
        throw parseError(error);
      }
    },
    ...options,
  });
}

/**
 * Query keys factory for consistent cache management
 */
export const queryKeys = {
  // Wallet & Balance
  walletBalance: (address?: string) => ['wallet', 'balance', address] as const,
  solPrice: () => ['prices', 'sol'] as const,
  tokenPrices: (symbols: string[]) => ['prices', 'tokens', ...symbols] as const,
  
  // Market data
  marketData: () => ['market', 'data'] as const,
  trendingTokens: () => ['market', 'trending'] as const,
  
  // User data
  userProfile: (userId?: string) => ['user', 'profile', userId] as const,
  userTokens: (userId?: string) => ['user', 'tokens', userId] as const,
  userTransactions: (userId?: string) => ['user', 'transactions', userId] as const,
  userAirdrops: (userId?: string) => ['user', 'airdrops', userId] as const,
  userBundles: (userId?: string) => ['user', 'bundles', userId] as const,
  
  // Analytics
  analytics: (userId?: string, date?: string) => ['analytics', userId, date] as const,
  
  // Admin
  adminStats: () => ['admin', 'stats'] as const,
  adminUsers: () => ['admin', 'users'] as const,
};

/**
 * Stale time configurations
 */
export const staleTimes = {
  price: 30 * 1000, // 30 seconds
  balance: 60 * 1000, // 1 minute
  market: 30 * 1000, // 30 seconds
  user: 5 * 60 * 1000, // 5 minutes
  analytics: 10 * 60 * 1000, // 10 minutes
};

/**
 * Invoke Supabase edge function with proper error handling
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });

  if (error) {
    throw new Error(error.message || `Failed to invoke ${functionName}`);
  }

  return data as T;
}
