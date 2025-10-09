import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Flame, Star, ArrowRight, Search, Sparkles, ChartCandlestick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTopTradingPairs, formatOKXPrice, calculatePriceChange } from "@/lib/okx";
import { getMoonShotTrending, getMoonShotGainers, MoonShotToken } from "@/lib/moonshot";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CryptoPrice {
  price: number | null;
  change: number;
  name: string;
  symbol: string;
  marketCap?: number;
  volume?: number;
}

export const MarketPreview = () => {
  const navigate = useNavigate();
  const [btcPrice, setBtcPrice] = useState<CryptoPrice>({ price: null, change: 0, name: "Bitcoin", symbol: "BTC" });
  const [ethPrice, setEthPrice] = useState<CryptoPrice>({ price: null, change: 0, name: "Ethereum", symbol: "ETH" });
  const [solPrice, setSolPrice] = useState<CryptoPrice>({ price: null, change: 0, name: "Solana", symbol: "SOL" });
  const [okxPairs, setOkxPairs] = useState<any[]>([]);
  const [moonShotTokens, setMoonShotTokens] = useState<MoonShotToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("marketFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (tokenId: string) => {
    const newFavorites = favorites.includes(tokenId)
      ? favorites.filter((id) => id !== tokenId)
      : [...favorites, tokenId];
    setFavorites(newFavorites);
    localStorage.setItem("marketFavorites", JSON.stringify(newFavorites));
  };

  const loadPriceData = async () => {
    setRefreshing(true);
    try {
      // Get BTC, ETH, SOL prices from OKX
      const [btcTicker, ethTicker, solTicker] = await Promise.all([
        fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT').then(r => r.json()),
        fetch('https://www.okx.com/api/v5/market/ticker?instId=ETH-USDT').then(r => r.json()),
        fetch('https://www.okx.com/api/v5/market/ticker?instId=SOL-USDT').then(r => r.json())
      ]);

      if (btcTicker.data?.[0]) {
        const ticker = btcTicker.data[0];
        setBtcPrice({
          price: parseFloat(ticker.last),
          change: calculatePriceChange(ticker.last, ticker.open24h),
          name: "Bitcoin",
          symbol: "BTC",
          volume: parseFloat(ticker.volCcy24h)
        });
      }

      if (ethTicker.data?.[0]) {
        const ticker = ethTicker.data[0];
        setEthPrice({
          price: parseFloat(ticker.last),
          change: calculatePriceChange(ticker.last, ticker.open24h),
          name: "Ethereum",
          symbol: "ETH",
          volume: parseFloat(ticker.volCcy24h)
        });
      }

      if (solTicker.data?.[0]) {
        const ticker = solTicker.data[0];
        setSolPrice({
          price: parseFloat(ticker.last),
          change: calculatePriceChange(ticker.last, ticker.open24h),
          name: "Solana",
          symbol: "SOL",
          volume: parseFloat(ticker.volCcy24h)
        });
      }

      // Load all market data
      const [topPairs, moonShot] = await Promise.all([
        getTopTradingPairs(50), // Top 50 with bulk endpoint and caching
        getMoonShotTrending()
      ]);

      if (topPairs.length > 0) setOkxPairs(topPairs);
      if (moonShot.length > 0) setMoonShotTokens(moonShot);
      
      if (!loading) {
        toast({
          title: "Markets Updated",
          description: `${topPairs.length} OKX + ${moonShot.length} MoonShot tokens`,
        });
      }
    } catch (error) {
      console.error("Error loading market data:", error);
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
    // Update every 30 seconds to match cache duration
    const interval = setInterval(loadPriceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredOkx = useMemo(() => {
    if (!searchQuery) return okxPairs;
    return okxPairs.filter((pair) =>
      pair.instId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [okxPairs, searchQuery]);

  const filteredMoonShot = useMemo(() => {
    if (!searchQuery) return moonShotTokens;
    return moonShotTokens.filter(
      (token) =>
        token.baseToken?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.baseToken?.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [moonShotTokens, searchQuery]);

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Market Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ChartCandlestick className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Live Market Data
                <Badge variant="outline" className="gap-1">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Real-time
                </Badge>
              </CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadPriceData}
            disabled={refreshing}
            className="hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* Major Crypto Prices - Enhanced */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[btcPrice, ethPrice, solPrice].map((crypto) => (
            <div 
              key={crypto.symbol} 
              className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-all group cursor-pointer"
              onClick={() => navigate("/markets")}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">{crypto.name}</p>
                    {favorites.includes(crypto.symbol) && (
                      <Star className="w-3 h-3 fill-accent text-accent" />
                    )}
                  </div>
                  <Badge
                    variant={crypto.change >= 0 ? "default" : "destructive"}
                    className="gap-1 h-6 text-xs"
                  >
                    {crypto.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {crypto.change >= 0 ? "+" : ""}{crypto.change.toFixed(2)}%
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold group-hover:text-primary transition-colors">
                    ${crypto.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "---"}
                  </p>
                  <p className="text-xs text-muted-foreground">{crypto.symbol}</p>
                </div>
                {crypto.volume && (
                  <p className="text-xs text-muted-foreground">
                    Vol: ${(crypto.volume / 1e9).toFixed(2)}B
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-primary/20 focus:border-primary/40"
          />
        </div>

        <Tabs defaultValue="okx" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="okx" className="gap-1 data-[state=active]:bg-primary/10">
              <Activity className="w-3 h-3" />
              OKX Top 50
            </TabsTrigger>
            <TabsTrigger value="moonshot" className="gap-1 data-[state=active]:bg-primary/10">
              <Sparkles className="w-3 h-3" />
              MoonShot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moonshot" className="mt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" />
                Trending MoonShot Tokens
              </p>
              <Badge variant="outline" className="text-xs">
                {filteredMoonShot.length} tokens
              </Badge>
            </div>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {filteredMoonShot.slice(0, 20).map((token, index) => {
                  const priceChange = parseFloat(String(token.priceChange?.h24 || "0"));
                  return (
                    <div
                      key={token.pairAddress}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-primary/5 rounded-lg hover:from-muted hover:to-primary/10 transition-all cursor-pointer group border border-primary/10 hover:border-primary/30"
                      onClick={() => navigate("/markets")}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground font-mono w-6 flex-shrink-0">
                          #{index + 1}
                        </span>
                        {token.info?.imageUrl && (
                          <img
                            src={token.info.imageUrl}
                            alt={token.baseToken?.name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {token.baseToken?.symbol || "N/A"}
                            </p>
                            <Badge className="bg-gradient-to-r from-accent to-primary text-white text-[10px] h-4 px-1">
                              🚀
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {token.baseToken?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-semibold whitespace-nowrap">
                          ${parseFloat(token.priceUsd || "0").toFixed(6)}
                        </p>
                        <Badge
                          variant={priceChange >= 0 ? "default" : "destructive"}
                          className="text-[10px] h-5 mt-1"
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
          </TabsContent>

          <TabsContent value="okx" className="mt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground">
                Top Trading Pairs by Volume
              </p>
              <Badge variant="outline" className="text-xs">
                {filteredOkx.length} pairs
              </Badge>
            </div>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {filteredOkx.slice(0, 20).map((pair, index) => {
                  const priceChange = pair.ticker
                    ? calculatePriceChange(pair.ticker.last, pair.ticker.open24h)
                    : 0;
                  
                  return (
                    <div
                      key={pair.instId}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-all cursor-pointer group border border-transparent hover:border-primary/20"
                      onClick={() => navigate("/markets")}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground font-mono w-6 flex-shrink-0">
                          #{index + 1}
                        </span>
                        <img
                          src={`https://www.cryptocompare.com/media/37746251/${(pair.baseCcy || pair.instId.split("-")[0]).toLowerCase()}.png`}
                          alt={pair.instId}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {pair.instId}
                          </p>
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
                          className="text-[10px] h-5 mt-1"
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
          </TabsContent>
        </Tabs>

        {/* Enhanced CTA Footer */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Live updates • CoinGecko • OKX • MoonShot</span>
            </div>
          </div>
          <Button
            variant="default"
            className="w-full gap-2 group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            onClick={() => navigate("/markets")}
          >
            <ChartCandlestick className="w-4 h-4" />
            Explore Full Markets Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};