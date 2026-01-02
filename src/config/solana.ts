/**
 * Centralized Solana Configuration
 * All Solana-related constants and settings in one place
 */

// Supabase project for RPC proxy
const SUPABASE_PROJECT_ID = 'tfvkpoplhmjefabvhrru';

// RPC Proxy endpoint - hides API keys and adds rate limiting/caching
export const SOLANA_RPC_PROXY_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/solana-rpc-proxy`;

// Direct public RPC as fallback (rate-limited by Solana)
export const SOLANA_PUBLIC_RPC = 'https://api.mainnet-beta.solana.com';

// Use proxy by default, with env override for local development
export const SOLANA_RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL || SOLANA_RPC_PROXY_URL;

// Token Program IDs
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

// CoinGecko Configuration
export const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
export const COINGECKO_CACHE_DURATION = 60000; // 1 minute
export const COINGECKO_REFRESH_INTERVAL = 120000; // 2 minutes

// Wallet Balance Configuration
export const BALANCE_REFRESH_INTERVAL = 30000; // 30 seconds
export const MAX_TOKEN_DISPLAY = 10; // Max SPL tokens to show

// Lamports conversion
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Network detection
export const isMainnet = SOLANA_RPC_ENDPOINT.includes('mainnet');
export const isDevnet = SOLANA_RPC_ENDPOINT.includes('devnet');
export const networkName = isMainnet ? 'Mainnet' : isDevnet ? 'Devnet' : 'Custom';
