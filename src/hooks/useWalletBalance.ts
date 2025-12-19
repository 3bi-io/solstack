import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  BALANCE_REFRESH_INTERVAL, 
  MAX_TOKEN_DISPLAY 
} from '@/config/solana';
import type { TokenBalance, WalletBalances } from '@/types/wallet';

export function useWalletBalance(): WalletBalances & { refresh: () => void } {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [sol, setSol] = useState(0);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connected) {
      setSol(0);
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setSol(solBalance / LAMPORTS_PER_SOL);

      // Fetch SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey(TOKEN_PROGRAM_ID) }
      );

      const tokenBalances: TokenBalance[] = tokenAccounts.value
        .map((account) => {
          const parsedInfo = account.account.data.parsed?.info;
          if (!parsedInfo) return null;

          const balance = parsedInfo.tokenAmount?.uiAmount ?? 0;
          const decimals = parsedInfo.tokenAmount?.decimals ?? 0;
          const mint = parsedInfo.mint ?? '';

          // Only include tokens with balance > 0
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

      setTokens(tokenBalances);
    } catch (err) {
      console.error('Error fetching wallet balances:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    fetchBalances();

    const interval = setInterval(fetchBalances, BALANCE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  const solFormatted = sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  return {
    sol,
    solFormatted,
    tokens,
    isLoading,
    error,
    refresh: fetchBalances,
  };
}
