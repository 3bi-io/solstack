/**
 * MoonShot API Integration
 * For new Solana token launches and trending meme coins
 */

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex";
const MOONSHOT_PROGRAM = "MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG";

export interface MoonShotToken {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

/**
 * Get trending Solana tokens with high activity
 */
export async function getMoonShotTrending(): Promise<MoonShotToken[]> {
  try {
    // Use search endpoint with Solana filter for better results
    const response = await fetch(
      `${DEXSCREENER_API}/search?q=SOL`
    );

    if (!response.ok) {
      throw new Error(`DEXScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for Solana chain and sort by 24h volume and transactions
    const activePairs = (data.pairs || [])
      .filter((pair: any) => {
        const isSolana = pair.chainId === 'solana';
        const volume24h = pair.volume?.h24 || 0;
        const txns24h = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
        return isSolana && volume24h > 10000 && txns24h > 50; // Active Solana tokens only
      })
      .sort((a: any, b: any) => {
        const aScore = (a.volume?.h24 || 0) * ((a.txns?.h24?.buys || 0) + (a.txns?.h24?.sells || 0));
        const bScore = (b.volume?.h24 || 0) * ((b.txns?.h24?.buys || 0) + (b.txns?.h24?.sells || 0));
        return bScore - aScore;
      });
    
    return activePairs.slice(0, 50); // Return top 50
  } catch (error) {
    console.error('Error fetching trending Solana tokens:', error);
    return [];
  }
}

/**
 * Get new MoonShot launches (24h)
 */
export async function getMoonShotNewLaunches(): Promise<MoonShotToken[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API}/tokens/solana/latest`
    );

    if (!response.ok) {
      throw new Error(`DEXScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for recent launches (last 24 hours)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    return (data.pairs || [])
      .filter((pair: any) => {
        const createdAt = pair.pairCreatedAt || 0;
        return createdAt >= oneDayAgo;
      })
      .slice(0, 30);
  } catch (error) {
    console.error('Error fetching MoonShot new launches:', error);
    return [];
  }
}

/**
 * Get boosted/promoted MoonShot tokens
 */
export async function getMoonShotBoosted(): Promise<MoonShotToken[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API}/token-boosts/latest/v1`
    );

    if (!response.ok) {
      throw new Error(`DEXScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for Solana tokens
    return (data || [])
      .filter((item: any) => item.chainId === 'solana')
      .slice(0, 20);
  } catch (error) {
    console.error('Error fetching MoonShot boosted:', error);
    return [];
  }
}

/**
 * Search MoonShot tokens by query
 */
export async function searchMoonShotTokens(query: string): Promise<MoonShotToken[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`DEXScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for Solana tokens
    return (data.pairs || [])
      .filter((pair: any) => pair.chainId === 'solana')
      .slice(0, 20);
  } catch (error) {
    console.error('Error searching MoonShot tokens:', error);
    return [];
  }
}

/**
 * Get token details by address
 */
export async function getMoonShotTokenByAddress(address: string): Promise<MoonShotToken[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API}/tokens/${address}`
    );

    if (!response.ok) {
      throw new Error(`DEXScreener API error: ${response.status}`);
    }

    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error('Error fetching MoonShot token:', error);
    return [];
  }
}

/**
 * Get gainers from MoonShot
 */
export async function getMoonShotGainers(): Promise<MoonShotToken[]> {
  try {
    const trending = await getMoonShotTrending();
    
    // Sort by 24h price change
    return trending
      .filter(token => token.priceChange?.h24 > 0)
      .sort((a, b) => (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0))
      .slice(0, 20);
  } catch (error) {
    console.error('Error fetching MoonShot gainers:', error);
    return [];
  }
}

/**
 * Format MoonShot data for display
 */
export function formatMoonShotToken(token: MoonShotToken) {
  return {
    id: token.pairAddress,
    name: token.baseToken.name,
    symbol: token.baseToken.symbol,
    address: token.baseToken.address,
    price: parseFloat(token.priceUsd || '0'),
    priceChange24h: token.priceChange?.h24 || 0,
    volume24h: token.volume?.h24 || 0,
    liquidity: token.liquidity?.usd || 0,
    marketCap: token.marketCap || token.fdv || 0,
    imageUrl: token.info?.imageUrl,
    pairCreatedAt: token.pairCreatedAt,
    txns24h: (token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0),
    url: token.url,
  };
}
