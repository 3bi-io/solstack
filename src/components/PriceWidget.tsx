import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTokenPrice, getTrendingTokens, TokenInfo } from "@/lib/coingecko";
import { getOKXTicker, searchSOLPairs, formatOKXPrice, calculatePriceChange } from "@/lib/okx";
import { Skeleton } from "@/components/ui/skeleton";

export const PriceWidget = () => {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [solChange, setSolChange] = useState<number>(0);
  const [trending, setTrending] = useState<TokenInfo[]>([]);
  const [okxPairs, setOkxPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPriceData = async () => {
    setRefreshing(true);
    try {
      // Fetch SOL price from CoinGecko
      const solData = await getTokenPrice("So11111111111111111111111111111111111111112");
      if (solData) {
        setSolPrice(solData.usd);
        setSolChange(solData.usd_24h_change);
      }

      // Fetch trending tokens
      const trendingData = await getTrendingTokens();
      setTrending(trendingData.slice(0, 5));

      // Fetch SOL pairs from OKX
      const pairs = await searchSOLPairs();
      const pairsWithPrices = await Promise.all(
        pairs.slice(0, 5).map(async (pair) => {
          const ticker = await getOKXTicker(pair.instId);
          return { ...pair, ticker };
        })
      );
      setOkxPairs(pairsWithPrices.filter(p => p.ticker));
    } catch (error) {
      console.error("Error loading price data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPriceData();
    // Refresh every 60 seconds
    const interval = setInterval(loadPriceData, 60000);
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
        {/* SOL Price */}
        <div className="mb-4 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Solana</p>
              <p className="text-2xl font-bold">
                ${solPrice?.toFixed(2) || "---"}
              </p>
            </div>
            <Badge
              variant={solChange >= 0 ? "default" : "destructive"}
              className="gap-1"
            >
              {solChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(solChange).toFixed(2)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by CoinGecko
          </p>
        </div>

        <Tabs defaultValue="coingecko" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coingecko">CoinGecko</TabsTrigger>
            <TabsTrigger value="okx">OKX Exchange</TabsTrigger>
          </TabsList>

          <TabsContent value="coingecko" className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Trending Tokens
            </p>
            {trending.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {token.image && (
                    <img
                      src={token.image}
                      alt={token.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{token.symbol.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  {token.current_price > 0 && (
                    <>
                      <p className="text-sm font-semibold">
                        ${token.current_price.toFixed(token.current_price < 1 ? 4 : 2)}
                      </p>
                      <Badge
                        variant={
                          token.price_change_percentage_24h >= 0
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {token.price_change_percentage_24h?.toFixed(2)}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="okx" className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              SOL Trading Pairs
            </p>
            {okxPairs.map((pair) => {
              const priceChange = pair.ticker
                ? calculatePriceChange(pair.ticker.last, pair.ticker.open24h)
                : 0;
              
              return (
                <div
                  key={pair.instId}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{pair.instId}</p>
                    <p className="text-xs text-muted-foreground">
                      Vol: {pair.ticker ? parseFloat(pair.ticker.vol24h).toFixed(2) : "---"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ${pair.ticker ? formatOKXPrice(pair.ticker.last) : "---"}
                    </p>
                    <Badge
                      variant={priceChange >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {priceChange.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground mt-2">
              Powered by OKX Exchange
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
