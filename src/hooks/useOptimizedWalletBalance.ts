import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  MAX_TOKEN_DISPLAY 
} from '@/config/solana';
import { queryKeys, staleTimes } from './useApiQuery';
import type { TokenBalance } from '@/types/wallet';

interface WalletBalanceData {
  sol: number;
  solFormatted: string;
  tokens: TokenBalance[];
}

/**
 * React Query-powered wallet balance hook with caching
 */
export function useOptimizedWalletBalance() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.walletBalance(publicKey?.toString()),
    queryFn: async (): Promise<WalletBalanceData> => {
      if (!publicKey || !connected) {
        return { sol: 0, solFormatted: '0.00', tokens: [] };
      }

      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const sol = solBalance / LAMPORTS_PER_SOL;

      // Fetch SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey(TOKEN_PROGRAM_ID) }
      );

      const tokens: TokenBalance[] = tokenAccounts.value
        .map((account) => {
          const parsedInfo = account.account.data.parsed?.info;
          if (!parsedInfo) return null;

          const balance = parsedInfo.tokenAmount?.uiAmount ?? 0;
          const decimals = parsedInfo.tokenAmount?.decimals ?? 0;
          const mint = parsedInfo.mint ?? '';

          if (balance <= 0) return null;

          return {
            mint,
            symbol: mint.slice(0, 4) + '...',
            balance,
            decimals,
            uiBalance: balance.toLocaleString(undefined, {
              maximumFractionDigits: decimals > 4 ? 4 : decimals,
            }),
          };
        })
        .filter((t): t is TokenBalance => t !== null)
        .slice(0, MAX_TOKEN_DISPLAY);

      const solFormatted = sol.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });

      return { sol, solFormatted, tokens };
    },
    enabled: connected && !!publicKey,
    staleTime: staleTimes.balance,
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance(publicKey?.toString()) });
  };

  return {
    sol: query.data?.sol ?? 0,
    solFormatted: query.data?.solFormatted ?? '0.00',
    tokens: query.data?.tokens ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh,
  };
}
