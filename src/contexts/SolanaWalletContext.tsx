import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

// ⚠️ CRITICAL: Configure your dedicated Solana Mainnet RPC endpoint below
// 
// The current endpoint may be invalid or rate-limited. You MUST replace it with your own.
// 
// 🔥 Recommended RPC Providers (Production-Grade):
// 
// 1. Helius (Recommended) - https://www.helius.dev/
//    - Free tier: 100 req/sec, excellent reliability
//    - Format: 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY'
// 
// 2. QuickNode - https://www.quicknode.com/
//    - Free tier: 10M/month requests
//    - Format: 'https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/'
// 
// 3. Alchemy - https://www.alchemy.com/solana
//    - Free tier: 300M compute units/month
//    - Format: 'https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY'
//
// ⚙️ Setup Instructions:
// 1. Sign up for one of the providers above (Helius recommended)
// 2. Create a new Solana Mainnet endpoint
// 3. Copy your endpoint URL with API key
// 4. Replace the RPC_ENDPOINT value below
// 5. Save and test your connection
//
// Note: This RPC is for FRONTEND wallet connections only. Backend edge functions
// use the SOLANA_RPC_URL secret configured in Supabase.
const RPC_ENDPOINT = 'https://magical-convincing-sun.solana-mainnet.quiknode.pro/ffea6c68c8d168b0c2e2bcacbfe1c7cf676da07e/';

// Supporting multiple popular Solana wallets
// OKX Wallet support: Install OKX Wallet browser extension to use

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
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
