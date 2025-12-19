/**
 * Price and market data type definitions
 */

export interface TokenPrice {
  id: string;
  symbol: string;
  usd: number;
  usd_24h_change?: number;
}

export interface SolPriceData {
  solPrice: number | null;
  sol24hChange: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface PriceCache {
  sol: number | null;
  sol24hChange: number | null;
  timestamp: number;
}
