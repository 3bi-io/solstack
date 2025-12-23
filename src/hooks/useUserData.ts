import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys, staleTimes } from './useApiQuery';
import { showErrorToast } from '@/lib/api-error';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'>;

/**
 * React Query-powered transactions hook with optimistic updates
 */
export function useTransactions(limit = 20) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.userTransactions(user?.id),
    queryFn: async (): Promise<Transaction[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: staleTimes.user,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userTransactions(user?.id) });
  };

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh,
  };
}

/**
 * Hook to create a new transaction with optimistic update
 */
export function useCreateTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userTransactions(user?.id) });
      toast({
        title: 'Transaction Created',
        description: 'Your transaction has been recorded.',
      });
    },
    onError: (error) => {
      showErrorToast(error, 'Transaction Failed');
    },
  });
}

/**
 * Hook to fetch tokens launched by the user
 */
export function useUserTokens() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.userTokens(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: staleTimes.user,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userTokens(user?.id) });
  };

  return {
    tokens: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh,
  };
}

/**
 * Hook to fetch user's airdrops
 */
export function useUserAirdrops() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.userAirdrops(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('airdrops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: staleTimes.user,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userAirdrops(user?.id) });
  };

  return {
    airdrops: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh,
  };
}

/**
 * Hook to fetch user's bundles
 */
export function useUserBundles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.userBundles(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: staleTimes.user,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userBundles(user?.id) });
  };

  return {
    bundles: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh,
  };
}
