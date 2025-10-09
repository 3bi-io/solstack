/**
 * OKX Exchange API Integration
 * For trading and market data
 * Requires API credentials for authenticated endpoints
 */

const OKX_API_BASE = "https://www.okx.com/api/v5";

export interface OKXTicker {
  instId: string;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volCcy24h: string;
  vol24h: string;
  ts: string;
}

export interface OKXOrderBook {
  asks: [string, string, string, string][]; // [price, size, liquidated orders, number of orders]
  bids: [string, string, string, string][];
  ts: string;
}

// Cache for bulk tickers
interface OKXCache {
  data: OKXTicker[];
  timestamp: number;
  expiresIn: number;
}

let bulkTickersCache: OKXCache | null = null;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Get all spot tickers in a single bulk request (cached)
 * This is much faster than individual requests
 */
export async function getOKXBulkTickers(forceRefresh: boolean = false): Promise<OKXTicker[]> {
  const now = Date.now();
  
  // Return cached data if valid
  if (!forceRefresh && bulkTickersCache && (now - bulkTickersCache.timestamp < CACHE_DURATION)) {
    console.log('✓ OKX: Using cached data', {
      age: ((now - bulkTickersCache.timestamp) / 1000).toFixed(1) + 's',
      tokens: bulkTickersCache.data.length
    });
    return bulkTickersCache.data;
  }

  try {
    console.log('⟳ OKX: Fetching bulk tickers...');
    const startTime = Date.now();
    
    const response = await fetch(`${OKX_API_BASE}/market/tickers?instType=SPOT`);
    
    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== "0" || !data.data) {
      console.error('OKX API returned error:', data.msg);
      return bulkTickersCache?.data || [];
    }

    const fetchTime = Date.now() - startTime;
    console.log(`✓ OKX: Fetched ${data.data.length} tickers in ${fetchTime}ms`);
    
    // Cache the results
    bulkTickersCache = {
      data: data.data,
      timestamp: now,
      expiresIn: CACHE_DURATION
    };
    
    return data.data;
  } catch (error) {
    console.error("Error fetching OKX bulk tickers:", error);
    // Return stale cache if available
    return bulkTickersCache?.data || [];
  }
}

/**
 * Get ticker information for a trading pair
 * Public endpoint - no authentication required
 */
export async function getOKXTicker(instId: string): Promise<OKXTicker | null> {
  try {
    const response = await fetch(
      `${OKX_API_BASE}/market/ticker?instId=${instId}`
    );
    
    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== "0" || !data.data || data.data.length === 0) {
      return null;
    }
    
    return data.data[0];
  } catch (error) {
    console.error("Error fetching OKX ticker:", error);
    return null;
  }
}

/**
 * Get order book for a trading pair
 * Public endpoint - no authentication required
 */
export async function getOKXOrderBook(
  instId: string,
  sz: number = 20
): Promise<OKXOrderBook | null> {
  try {
    const response = await fetch(
      `${OKX_API_BASE}/market/books?instId=${instId}&sz=${sz}`
    );
    
    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== "0" || !data.data || data.data.length === 0) {
      return null;
    }
    
    return data.data[0];
  } catch (error) {
    console.error("Error fetching OKX order book:", error);
    return null;
  }
}

/**
 * Get all available trading pairs with volume data
 * Public endpoint - no authentication required
 */
export async function getOKXInstruments(
  instType: "SPOT" | "SWAP" | "FUTURES" | "OPTION" = "SPOT"
): Promise<any[]> {
  try {
    const response = await fetch(
      `${OKX_API_BASE}/public/instruments?instType=${instType}`
    );
    
    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== "0") {
      return [];
    }
    
    return data.data || [];
  } catch (error) {
    console.error("Error fetching OKX instruments:", error);
    return [];
  }
}

export interface OKXTickerData {
  instId: string;
  baseCcy?: string;
  ticker: OKXTicker | null;
  volume: number;
}

/**
 * Get top trading pairs by volume (up to 50 pairs) using bulk endpoint
 * Much faster than individual requests: ~0.5s vs ~6s
 */
export async function getTopTradingPairs(limit: number = 50): Promise<OKXTickerData[]> {
  try {
    // Fetch all tickers in one request
    const allTickers = await getOKXBulkTickers();
    
    if (allTickers.length === 0) {
      return [];
    }

    // Filter for USDT pairs only and convert to OKXTickerData format
    const usdtPairs = allTickers
      .filter(ticker => ticker.instId.endsWith('-USDT'))
      .map(ticker => ({
        instId: ticker.instId,
        baseCcy: ticker.instId.split('-')[0],
        ticker: ticker,
        volume: parseFloat(ticker.volCcy24h) || 0
      }));

    // Sort by volume (descending) and take top N
    usdtPairs.sort((a, b) => b.volume - a.volume);
    
    const topPairs = usdtPairs.slice(0, limit);
    
    console.log(`✓ OKX: Returning top ${topPairs.length} pairs by volume`);
    
    return topPairs;
  } catch (error) {
    console.error('Error getting top trading pairs:', error);
    return [];
  }
}

/**
 * Clear the cache (useful for manual refresh)
 */
export function clearOKXCache() {
  bulkTickersCache = null;
  console.log('✓ OKX: Cache cleared');
}

/**
 * Search for SOL trading pairs on OKX
 */
export async function searchSOLPairs(): Promise<any[]> {
  try {
    const instruments = await getOKXInstruments("SPOT");
    return instruments.filter(inst => 
      inst.instId.includes("SOL") || 
      inst.baseCcy === "SOL" || 
      inst.quoteCcy === "SOL"
    );
  } catch (error) {
    console.error("Error searching SOL pairs:", error);
    return [];
  }
}

/**
 * Format price with appropriate decimals
 */
export function formatOKXPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "0.00";
  
  if (num >= 1) {
    return num.toFixed(2);
  } else if (num >= 0.01) {
    return num.toFixed(4);
  } else {
    return num.toFixed(8);
  }
}

/**
 * Calculate 24h price change percentage
 */
export function calculatePriceChange(current: string, open24h: string): number {
  const currentPrice = parseFloat(current);
  const openPrice = parseFloat(open24h);
  
  if (isNaN(currentPrice) || isNaN(openPrice) || openPrice === 0) {
    return 0;
  }
  
  return ((currentPrice - openPrice) / openPrice) * 100;
}

/**
 * Get logo URL for a token symbol
 */
export function getTokenLogoUrl(symbol: string): string {
  // Use CryptoCompare API for token logos
  const cleanSymbol = symbol.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return `https://www.cryptocompare.com/media/37746251/btc.png`.replace('btc', cleanSymbol.toLowerCase());
}

/**
 * Get logo URL using alternative services
 */
export function getAlternativeTokenLogo(symbol: string): string {
  const cleanSymbol = symbol.replace(/[^a-zA-Z]/g, '').toUpperCase();
  // Using CoinGecko's assets via jsdelivr CDN
  return `https://assets.coingecko.com/coins/images/1/large/${cleanSymbol.toLowerCase()}.png`;
}
