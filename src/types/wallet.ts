/**
 * Wallet-related type definitions
 */

export interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  uiBalance: string;
}

export interface WalletBalances {
  sol: number;
  solFormatted: string;
  tokens: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

export interface WalletBalanceDisplayProps {
  compact?: boolean;
}
