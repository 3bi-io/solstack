import { SEO } from "./SEO";

interface TokenSEOProps {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  change24h: number;
  volume24h: number;
  logoUrl?: string;
  exchange?: string;
}

export const TokenSEO = ({
  symbol,
  name,
  price,
  marketCap,
  change24h,
  volume24h,
  logoUrl,
  exchange = "Multiple Exchanges"
}: TokenSEOProps) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  const changeText = change24h >= 0 ? `up ${change24h.toFixed(2)}%` : `down ${Math.abs(change24h).toFixed(2)}%`;
  const priceFormatted = price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(8)}`;
  
  const title = `${symbol} Price: ${priceFormatted} | ${changeText} (24h) | SOL Stack`;
  const description = `Live ${name} (${symbol}) price chart and market data. Current price: ${priceFormatted}, Market Cap: $${(marketCap / 1e6).toFixed(2)}M, 24h Volume: $${(volume24h / 1e6).toFixed(2)}M. Trade ${symbol} on ${exchange}.`;
  
  const keywords = `${symbol} price, ${name}, ${symbol} chart, ${symbol} market cap, buy ${symbol}, ${symbol} trading, crypto ${symbol}, ${exchange} ${symbol}`;
  
  // Generate dynamic OG image with token data
  const ogImageParams = new URLSearchParams({
    theme: 'token',
    symbol: symbol,
    price: price.toString(),
    marketCap: marketCap.toString(),
    change24h: change24h.toString(),
    volume24h: volume24h.toString(),
    logo: logoUrl || ''
  });
  
  const image = `${supabaseUrl}/functions/v1/generate-og-image?${ogImageParams.toString()}`;
  
  // Token-specific structured data
  const tokenSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${name} (${symbol})`,
    description: `Cryptocurrency token ${symbol} with real-time price tracking and market analysis`,
    image: logoUrl || image,
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://solstack.me/markets?token=${symbol}`
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: change24h >= 0 ? "4.5" : "3.5",
      reviewCount: "1000"
    },
    brand: {
      "@type": "Brand",
      name: exchange
    }
  };
  
  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      image={image}
      url={`/markets?token=${symbol}`}
      type="product"
      structuredData={tokenSchema}
    />
  );
};
