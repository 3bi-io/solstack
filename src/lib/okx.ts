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
 * Get all available trading pairs
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
