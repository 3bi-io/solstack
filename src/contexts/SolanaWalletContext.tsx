import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

// IMPORTANT: Replace this with your own RPC endpoint for production use
// The public endpoint is rate-limited and will cause connection issues
// 
// Recommended RPC Providers (all have free tiers):
// - Helius: https://www.helius.dev/ (100 req/sec free tier)
// - QuickNode: https://www.quicknode.com/
// - Alchemy: https://www.alchemy.com/solana
// 
// Example with Helius: 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY'
// Example with QuickNode: 'https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/'
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

// Supporting multiple popular Solana wallets
// OKX Wallet support: Install OKX Wallet browser extension to use

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      // OKX Wallet will auto-detect if installed
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
