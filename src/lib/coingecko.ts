/**
 * CoinGecko API Integration
 * Free API for cryptocurrency prices and market data
 * No API key required for basic usage
 */

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

export interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
  usd_24h_vol: number;
}

export interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
}

/**
 * Get current price for a token by contract address
 */
export async function getTokenPrice(
  contractAddress: string,
  platform: string = "solana"
): Promise<CoinGeckoPrice | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[contractAddress.toLowerCase()] || null;
  } catch (error) {
    console.error("Error fetching token price from CoinGecko:", error);
    return null;
  }
}

/**
 * Get detailed token information by CoinGecko ID
 */
export async function getTokenInfo(coinId: string): Promise<TokenInfo | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large || data.image?.small,
      current_price: data.market_data?.current_price?.usd || 0,
      market_cap: data.market_data?.market_cap?.usd || 0,
      market_cap_rank: data.market_cap_rank || 0,
      total_volume: data.market_data?.total_volume?.usd || 0,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
      circulating_supply: data.market_data?.circulating_supply || 0,
    };
  } catch (error) {
    console.error("Error fetching token info from CoinGecko:", error);
    return null;
  }
}

/**
 * Search for tokens by name or symbol
 */
export async function searchTokens(query: string): Promise<TokenInfo[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return top 10 coins from search results
    return (data.coins || []).slice(0, 10).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.large || coin.thumb,
      current_price: 0, // Search doesn't include price data
      market_cap: 0,
      market_cap_rank: coin.market_cap_rank || 0,
      total_volume: 0,
      price_change_percentage_24h: 0,
      circulating_supply: 0,
    }));
  } catch (error) {
    console.error("Error searching tokens on CoinGecko:", error);
    return [];
  }
}

/**
 * Get trending tokens
 */
export async function getTrendingTokens(): Promise<TokenInfo[]> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/search/trending`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return (data.coins || []).map((item: any) => ({
      id: item.item.id,
      symbol: item.item.symbol,
      name: item.item.name,
      image: item.item.large || item.item.thumb,
      current_price: item.item.data?.price || 0,
      market_cap: item.item.data?.market_cap || 0,
      market_cap_rank: item.item.market_cap_rank || 0,
      total_volume: item.item.data?.total_volume || 0,
      price_change_percentage_24h: item.item.data?.price_change_percentage_24h?.usd || 0,
      circulating_supply: 0,
    }));
  } catch (error) {
    console.error("Error fetching trending tokens from CoinGecko:", error);
    return [];
  }
}

/**
 * Get market data for multiple tokens by their CoinGecko IDs
 */
export async function getMarketsData(
  coinIds: string[],
  currency: string = "usd"
): Promise<TokenInfo[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=${currency}&ids=${coinIds.join(",")}&order=market_cap_desc&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price || 0,
      market_cap: coin.market_cap || 0,
      market_cap_rank: coin.market_cap_rank || 0,
      total_volume: coin.total_volume || 0,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      circulating_supply: coin.circulating_supply || 0,
    }));
  } catch (error) {
    console.error("Error fetching markets data from CoinGecko:", error);
    return [];
  }
}
