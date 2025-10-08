import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTokenPrice, getTrendingTokens, TokenInfo } from "@/lib/coingecko";
import { getOKXTicker, getTopTradingPairs, formatOKXPrice, calculatePriceChange } from "@/lib/okx";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface CryptoPrice {
  price: number | null;
  change: number;
  name: string;
  symbol: string;
}

export const PriceWidget = () => {
  const [btcPrice, setBtcPrice] = useState<CryptoPrice>({ price: null, change: 0, name: "Bitcoin", symbol: "BTC" });
  const [ethPrice, setEthPrice] = useState<CryptoPrice>({ price: null, change: 0, name: "Ethereum", symbol: "ETH" });
  const [solPrice, setSolPrice] = useState<CryptoPrice>({ price: null, change: 0, name: "Solana", symbol: "SOL" });
  const [trending, setTrending] = useState<TokenInfo[]>([]);
  const [okxPairs, setOkxPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPriceData = async () => {
    setRefreshing(true);
    try {
      // Fetch major crypto prices using CoinGecko IDs
      const cryptoIds = {
        bitcoin: { setter: setBtcPrice, name: "Bitcoin", symbol: "BTC" },
        ethereum: { setter: setEthPrice, name: "Ethereum", symbol: "ETH" },
        solana: { setter: setSolPrice, name: "Solana", symbol: "SOL" }
      };

      // Fetch prices for BTC, ETH, SOL
      const pricePromises = Object.entries(cryptoIds).map(async ([coinId, config]) => {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
          );
          const data = await response.json();
          
          if (data[coinId]) {
            config.setter({
              price: data[coinId].usd,
              change: data[coinId].usd_24h_change || 0,
              name: config.name,
              symbol: config.symbol
            });
          }
        } catch (error) {
          console.error(`Error fetching ${config.name} price:`, error);
        }
      });

      await Promise.all(pricePromises);

      // Fetch top 50 tokens with complete data
      const trendingData = await getTrendingTokens();
      if (trendingData.length > 0) {
        setTrending(trendingData);
      }

      // Fetch top 50 trading pairs from OKX by volume
      const topPairs = await getTopTradingPairs(50);
      setOkxPairs(topPairs);
      
      if (!loading) {
        toast({
          title: "Prices Updated",
          description: `Loaded ${trendingData.length} tokens and ${topPairs.length} trading pairs`,
        });
      }
    } catch (error) {
      console.error("Error loading price data:", error);
      toast({
        title: "Error",
        description: "Failed to load market data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPriceData();
    // Refresh every 30 seconds for real-time data
    const interval = setInterval(() => {
      loadPriceData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Market Prices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Market Prices
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadPriceData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Major Crypto Prices */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[btcPrice, ethPrice, solPrice].map((crypto) => (
            <div key={crypto.symbol} className="p-3 bg-primary/10 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{crypto.name}</p>
                  <Badge
                    variant={crypto.change >= 0 ? "default" : "destructive"}
                    className="gap-1 h-5 text-[10px]"
                  >
                    {crypto.change >= 0 ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    {crypto.change >= 0 ? "+" : ""}{crypto.change.toFixed(2)}%
                  </Badge>
                </div>
                <div>
                  <p className="text-xl font-bold">
                    ${crypto.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "---"}
                  </p>
                  <p className="text-xs text-muted-foreground">{crypto.symbol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mb-4">
          Powered by CoinGecko
        </p>

        <Tabs defaultValue="coingecko" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coingecko" className="gap-1">
              <Flame className="w-3 h-3" />
              Top 50
            </TabsTrigger>
            <TabsTrigger value="okx" className="gap-1">
              <Activity className="w-3 h-3" />
              OKX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coingecko" className="mt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Flame className="w-3 h-3 text-accent" />
                Top 50 Tokens by Market Cap
              </p>
              <Badge variant="outline" className="text-xs">
                {trending.length} tokens
              </Badge>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {trending.map((token: any, index) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground font-mono w-6 flex-shrink-0">
                        #{index + 1}
                      </span>
                      {token.image && (
                        <img
                          src={token.image}
                          alt={token.name}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">
                            {token.symbol.toUpperCase()}
                          </p>
                          {token.is_trending && (
                            <Flame className="w-3 h-3 text-accent flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {token.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      {token.current_price > 0 ? (
                        <>
                          <p className="text-sm font-semibold whitespace-nowrap">
                            ${token.current_price >= 1 
                              ? token.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                              : token.current_price < 0.01 
                              ? token.current_price.toFixed(6)
                              : token.current_price.toFixed(4)
                            }
                          </p>
                          <Badge
                            variant={
                              token.price_change_percentage_24h >= 0
                                ? "default"
                                : "destructive"
                            }
                            className="text-[10px] h-5"
                          >
                            {token.price_change_percentage_24h >= 0 ? "+" : ""}
                            {token.price_change_percentage_24h?.toFixed(2)}%
                          </Badge>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">N/A</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Updates every 30s</span>
                </div>
                <span>Powered by CoinGecko</span>
              </div>
              <Button
                variant="outline"
                className="w-full mt-3 gap-2"
                onClick={() => window.location.href = "/markets"}
              >
                <TrendingUp className="w-4 h-4" />
                View Full Markets
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="okx" className="mt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground">
                Top 50 by Volume (USDT Pairs)
              </p>
              <Badge variant="outline" className="text-xs">
                {okxPairs.length} pairs
              </Badge>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {okxPairs.map((pair, index) => {
                  const priceChange = pair.ticker
                    ? calculatePriceChange(pair.ticker.last, pair.ticker.open24h)
                    : 0;
                  
                  return (
                    <div
                      key={pair.instId}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground font-mono w-6 flex-shrink-0">
                          #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{pair.instId}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Vol: {pair.ticker ? parseFloat(pair.ticker.vol24h).toLocaleString(undefined, {maximumFractionDigits: 0}) : "---"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-semibold whitespace-nowrap">
                          ${pair.ticker ? formatOKXPrice(pair.ticker.last) : "---"}
                        </p>
                        <Badge
                          variant={priceChange >= 0 ? "default" : "destructive"}
                          className="text-[10px] h-5"
                        >
                          {priceChange >= 0 ? "+" : ""}
                          {priceChange.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Powered by OKX Exchange</span>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.location.href = "/markets"}
              >
                <TrendingUp className="w-4 h-4" />
                View Full Markets
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
