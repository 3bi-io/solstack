import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Star, ArrowRight, Search, ChartCandlestick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTopTradingPairs, formatOKXPrice, calculatePriceChange } from "@/lib/okx";
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

      const topPairs = await getTopTradingPairs(50);
      if (topPairs.length > 0) setOkxPairs(topPairs);
      
      if (!loading) {
        toast({
          title: "Markets Updated",
          description: `${topPairs.length} OKX tokens`,
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
    const interval = setInterval(loadPriceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredOkx = useMemo(() => {
    if (!searchQuery) return okxPairs;
    return okxPairs.filter((pair) =>
      pair.instId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [okxPairs, searchQuery]);

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
        {/* Major Crypto Prices */}
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

        {/* OKX Top Pairs */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Top Trading Pairs by Volume
          </p>
          <Badge variant="outline" className="text-xs font-mono">
            {filteredOkx.length} pairs
          </Badge>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-2">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Pair</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h</div>
          <div className="col-span-2 text-right">Volume</div>
          <div className="col-span-1 text-center">Risk</div>
        </div>

        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-1">
            {filteredOkx.slice(0, 20).map((pair, index) => {
              const priceChange = pair.ticker
                ? calculatePriceChange(pair.ticker.last, pair.ticker.open24h)
                : 0;
              
              // Mock AI risk scoring based on volatility and volume
              const getAIRisk = (change: number, vol: number) => {
                const absChange = Math.abs(change);
                if (absChange > 10) return { level: 'High', color: 'bg-destructive/20 text-destructive' };
                if (absChange > 5 || vol < 100000) return { level: 'Med', color: 'bg-yellow-500/20 text-yellow-400' };
                return { level: 'Low', color: 'bg-green-500/20 text-green-400' };
              };
              const risk = getAIRisk(priceChange, pair.ticker?.vol24h || 0);
              
              return (
                <div
                  key={pair.instId}
                  className="grid grid-cols-12 gap-2 items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-primary/20"
                  onClick={() => navigate("/markets")}
                >
                  <span className="col-span-1 text-xs text-muted-foreground font-mono">
                    {index + 1}
                  </span>
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <img
                      src={`https://www.cryptocompare.com/media/37746251/${(pair.baseCcy || pair.instId.split("-")[0]).toLowerCase()}.png`}
                      alt={pair.instId}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-sm font-mono font-semibold truncate group-hover:text-primary transition-colors">
                      {pair.instId}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-mono font-semibold">
                      ${pair.ticker ? formatOKXPrice(pair.ticker.last) : "---"}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <Badge
                      variant={priceChange >= 0 ? "default" : "destructive"}
                      className="text-[10px] h-5 font-mono"
                    >
                      {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-mono text-muted-foreground">
                      {pair.ticker ? (parseFloat(pair.ticker.vol24h) / 1000).toFixed(0) + 'K' : "---"}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${risk.color}`}>
                      {risk.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* CTA Footer */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Live updates • OKX</span>
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
