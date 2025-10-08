import { useState, useEffect, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  RefreshCw,
  Flame,
  ArrowUpDown,
  DollarSign,
  BarChart3,
  Zap
} from "lucide-react";
import { getTrendingTokens, TokenInfo } from "@/lib/coingecko";
import { getTopTradingPairs, formatOKXPrice, calculatePriceChange } from "@/lib/okx";
import { toast } from "@/hooks/use-toast";

interface MarketData {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  source: "coingecko" | "okx";
  rank?: number;
}

type SortField = "rank" | "price" | "change24h" | "volume24h" | "marketCap";
type SortDirection = "asc" | "desc";

const Markets = () => {
  const [cgTokens, setCgTokens] = useState<TokenInfo[]>([]);
  const [okxPairs, setOkxPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("volume24h");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [updateCount, setUpdateCount] = useState(0);

  const loadMarketData = async () => {
    setRefreshing(true);
    try {
      const [cgData, okxData] = await Promise.all([
        getTrendingTokens(),
        getTopTradingPairs(50)
      ]);

      setCgTokens(cgData);
      setOkxPairs(okxData);
      setUpdateCount(prev => prev + 1);

      if (!loading) {
        toast({
          title: "Markets Updated",
          description: `Loaded ${cgData.length + okxData.length} tokens`,
        });
      }
    } catch (error) {
      console.error("Error loading market data:", error);
      toast({
        title: "Error",
        description: "Failed to load market data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarketData();
    // Update every 10 seconds for real-time data
    const interval = setInterval(loadMarketData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Transform data to unified format
  const allMarketData = useMemo(() => {
    const cgData: MarketData[] = cgTokens.map((token, index) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      image: token.image,
      price: token.current_price || 0,
      change24h: token.price_change_percentage_24h || 0,
      volume24h: token.total_volume || 0,
      marketCap: token.market_cap,
      source: "coingecko" as const,
      rank: index + 1,
    }));

    const okxData: MarketData[] = okxPairs.map((pair, index) => ({
      id: pair.instId,
      name: pair.instId,
      symbol: pair.baseCcy || pair.instId.split("-")[0],
      price: pair.ticker ? parseFloat(pair.ticker.last) : 0,
      change24h: pair.ticker ? calculatePriceChange(pair.ticker.last, pair.ticker.open24h) : 0,
      volume24h: pair.ticker ? parseFloat(pair.ticker.vol24h) : 0,
      source: "okx" as const,
      rank: index + 1,
    }));

    return [...cgData, ...okxData];
  }, [cgTokens, okxPairs]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = allMarketData;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.symbol.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField] || 0;
      let bVal = b[sortField] || 0;

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [allMarketData, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Calculate global stats
  const globalStats = useMemo(() => {
    const totalVolume = allMarketData.reduce((sum, item) => sum + item.volume24h, 0);
    const avgChange = allMarketData.reduce((sum, item) => sum + item.change24h, 0) / allMarketData.length;
    const gainers = allMarketData.filter(item => item.change24h > 0).length;
    const losers = allMarketData.filter(item => item.change24h < 0).length;

    return { totalVolume, avgChange, gainers, losers };
  }, [allMarketData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Stats Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent flex items-center gap-2">
                  <Zap className="w-8 h-8 text-primary" />
                  Live Markets
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Real-time crypto market data • Updates every 10s
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadMarketData}
                disabled={refreshing}
                className="border-primary/30"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                </div>
                <p className="text-xl font-bold">
                  ${(globalStats.totalVolume / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-accent" />
                  <p className="text-sm text-muted-foreground">Avg Change</p>
                </div>
                <p className={`text-xl font-bold ${globalStats.avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {globalStats.avgChange >= 0 ? "+" : ""}{globalStats.avgChange.toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">Gainers</p>
                </div>
                <p className="text-xl font-bold text-green-500">{globalStats.gainers}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-muted-foreground">Losers</p>
                </div>
                <p className="text-xl font-bold text-red-500">{globalStats.losers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Market Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" />
                <CardTitle>All Markets ({filteredAndSortedData.length})</CardTitle>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Sort Controls */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                variant={sortField === "rank" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("rank")}
                className="gap-1"
              >
                Rank <ArrowUpDown className="w-3 h-3" />
              </Button>
              <Button
                variant={sortField === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("price")}
                className="gap-1"
              >
                Price <ArrowUpDown className="w-3 h-3" />
              </Button>
              <Button
                variant={sortField === "change24h" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("change24h")}
                className="gap-1"
              >
                24h % <ArrowUpDown className="w-3 h-3" />
              </Button>
              <Button
                variant={sortField === "volume24h" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("volume24h")}
                className="gap-1"
              >
                Volume <ArrowUpDown className="w-3 h-3" />
              </Button>
            </div>

            {/* Market Table */}
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredAndSortedData.map((item) => (
                  <div
                    key={`${item.source}-${item.id}`}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground font-mono w-8 flex-shrink-0">
                        #{item.rank}
                      </span>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {item.symbol.toUpperCase()}
                          </p>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {item.source}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold whitespace-nowrap">
                          ${item.price >= 1
                            ? item.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : item.price < 0.01
                            ? item.price.toFixed(6)
                            : item.price.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vol: ${(item.volume24h / 1e6).toFixed(2)}M
                        </p>
                      </div>
                      <Badge
                        variant={item.change24h >= 0 ? "default" : "destructive"}
                        className="min-w-[70px] justify-center gap-1"
                      >
                        {item.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {item.change24h >= 0 ? "+" : ""}
                        {item.change24h.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Live • Updates every 10s • Update #{updateCount}</span>
                </div>
                <span>Powered by CoinGecko & OKX</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Markets;
