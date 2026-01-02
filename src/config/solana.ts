/**
 * Centralized Solana Configuration
 * All Solana-related constants and settings in one place
 */

// RPC Endpoint for frontend wallet connections
// Uses public RPC for client-side operations (read-only, rate-limited)
// Backend edge functions use the SOLANA_RPC_URL secret in Supabase for write operations
// For production, consider using a proxy endpoint to hide API keys
export const SOLANA_RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

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
