import { useState, useEffect, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  RefreshCw,
  DollarSign,
  BarChart3,
  Zap,
  Download,
  Star,
  ArrowUpDown,
  Globe,
  Sparkles,
  Coins,
  Filter
} from "lucide-react";
import { getTopTradingPairs, formatOKXPrice, calculatePriceChange, getTokenLogoUrl } from "@/lib/okx";
import { getMoonShotTrending, formatMoonShotToken, MoonShotToken } from "@/lib/moonshot";
import { toast } from "@/hooks/use-toast";
import { MarketCard } from "@/components/markets/MarketCard";
import { MarketFilters, FilterCategory, FilterExchange } from "@/components/markets/MarketFilters";
import { TokenDetailDialog } from "@/components/markets/TokenDetailDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MarketData {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  source: "coingecko" | "okx" | "moonshot";
  rank?: number;
}

type SortField = "rank" | "price" | "change24h" | "volume24h" | "marketCap";
type SortDirection = "asc" | "desc";

const Markets = () => {
  const { user } = useAuth();
  const [okxPairs, setOkxPairs] = useState<any[]>([]);
  const [moonShotTokens, setMoonShotTokens] = useState<MoonShotToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory>("all");
  const [exchange, setExchange] = useState<FilterExchange>("all");
  const [sortField, setSortField] = useState<SortField>("volume24h");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [updateCount, setUpdateCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedToken, setSelectedToken] = useState<MarketData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdmin();
  }, [user]);

  const loadMarketData = async () => {
    setRefreshing(true);
    try {
      const [okxData, moonData] = await Promise.all([
        getTopTradingPairs(50), // Top 50 pairs using bulk endpoint with caching
        getMoonShotTrending()
      ]);

      setOkxPairs(okxData);
      setMoonShotTokens(moonData);
      setUpdateCount(prev => prev + 1);

      if (!loading && isAdmin) {
        toast({
          title: "Markets Updated",
          description: `Loaded ${okxData.length} OKX + ${moonData.length} MoonShot tokens`,
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
    // Update every 30 seconds (cache duration matches this)
    const interval = setInterval(loadMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("market-favorites");
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      localStorage.setItem("market-favorites", JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  // Transform data to unified format
  const allMarketData = useMemo(() => {
    const okxData: MarketData[] = okxPairs.map((pair, index) => {
      const symbol = pair.baseCcy || pair.instId.split("-")[0];
      return {
        id: pair.instId,
        name: pair.instId,
        symbol: symbol,
        image: getTokenLogoUrl(symbol),
        price: pair.ticker ? parseFloat(pair.ticker.last) : 0,
        change24h: pair.ticker ? calculatePriceChange(pair.ticker.last, pair.ticker.open24h) : 0,
        volume24h: pair.ticker ? parseFloat(pair.ticker.vol24h) : 0,
        source: "okx" as const,
        rank: index + 1,
      };
    });

    const moonData: MarketData[] = moonShotTokens.map((token, index) => {
      const formatted = formatMoonShotToken(token);
      return {
        id: formatted.id,
        name: formatted.name,
        symbol: formatted.symbol,
        image: formatted.imageUrl,
        price: formatted.price,
        change24h: formatted.priceChange24h,
        volume24h: formatted.volume24h,
        marketCap: formatted.marketCap,
        source: "moonshot" as const,
        rank: index + 1,
      };
    });

    return [...okxData, ...moonData];
  }, [okxPairs, moonShotTokens]);

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

    // Apply category filter
    if (category === "favorites") {
      filtered = filtered.filter(item => favorites.has(item.id));
    } else if (category === "gainers") {
      filtered = filtered.filter(item => item.change24h > 0);
    } else if (category === "losers") {
      filtered = filtered.filter(item => item.change24h < 0);
    } else if (category === "trending") {
      filtered = filtered.filter(item => item.source === "moonshot");
    }

    // Apply exchange filter
    if (exchange !== "all") {
      filtered = filtered.filter(item => item.source === exchange);
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
  }, [allMarketData, searchQuery, category, exchange, favorites, sortField, sortDirection]);

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
    const avgChange = allMarketData.reduce((sum, item) => sum + item.change24h, 0) / (allMarketData.length || 1);
    const gainers = allMarketData.filter(item => item.change24h > 0).length;
    const losers = allMarketData.filter(item => item.change24h < 0).length;
    
    // Only calculate market cap for tokens that have this data (MoonShot tokens)
    const tokensWithMarketCap = allMarketData.filter(item => item.marketCap && item.marketCap > 0);
    const totalMarketCap = tokensWithMarketCap.reduce((sum, item) => sum + (item.marketCap || 0), 0);
    const hasMarketCapData = tokensWithMarketCap.length > 0;

    return { totalVolume, avgChange, gainers, losers, totalMarketCap, hasMarketCapData, tokensWithMarketCap: tokensWithMarketCap.length };
  }, [allMarketData]);

  const exportData = () => {
    const csv = [
      ["Rank", "Symbol", "Name", "Price", "24h Change", "Volume", "Market Cap", "Source"],
      ...filteredAndSortedData.map(item => [
        item.rank,
        item.symbol,
        item.name,
        item.price,
        item.change24h,
        item.volume24h,
        item.marketCap || "",
        item.source,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markets-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: `Exported ${filteredAndSortedData.length} tokens to CSV`,
    });
  };

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
        {/* Hero Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
          
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    Live Markets
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="w-3 h-3" />
                      Real-time data
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Globe className="w-3 h-3" />
                      Multi-source
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
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
            </div>
          </CardHeader>
        </Card>

        {/* Loaded Tokens Stats */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {globalStats.hasMarketCapData && (
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Market Cap ({globalStats.tokensWithMarketCap} tokens)
                  </p>
                </div>
                <p className="text-xl font-bold">
                  ${globalStats.totalMarketCap >= 1e9 
                    ? (globalStats.totalMarketCap / 1e9).toFixed(2) + 'B' 
                    : globalStats.totalMarketCap >= 1e6 
                    ? (globalStats.totalMarketCap / 1e6).toFixed(2) + 'M' 
                    : globalStats.totalMarketCap.toFixed(0)}
                </p>
              </div>
            )}
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">24h Volume</p>
              </div>
              <p className="text-xl font-bold">
                ${(globalStats.totalVolume / 1e9).toFixed(2)}B
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Avg Change</p>
              </div>
              <p className={`text-xl font-bold ${globalStats.avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {globalStats.avgChange >= 0 ? "+" : ""}{globalStats.avgChange.toFixed(2)}%
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-xs text-muted-foreground">Gainers</p>
              </div>
              <p className="text-xl font-bold text-green-500">{globalStats.gainers}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <p className="text-xs text-muted-foreground">Losers</p>
              </div>
              <p className="text-xl font-bold text-red-500">{globalStats.losers}</p>
            </div>
          </div>
        </div>

        {/* Filters & Market List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <CardTitle>Market Explorer</CardTitle>
              </div>
              {favorites.size > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {favorites.size} favorites
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Filters */}
            <MarketFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              category={category}
              onCategoryChange={setCategory}
              exchange={exchange}
              onExchangeChange={setExchange}
              resultsCount={filteredAndSortedData.length}
            />

            {/* Sort Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Sort by:</span>
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
                24h Change <ArrowUpDown className="w-3 h-3" />
              </Button>
              <Button
                variant={sortField === "volume24h" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("volume24h")}
                className="gap-1"
              >
                Volume <ArrowUpDown className="w-3 h-3" />
              </Button>
              <Button
                variant={sortField === "marketCap" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("marketCap")}
                className="gap-1"
              >
                Market Cap <ArrowUpDown className="w-3 h-3" />
              </Button>
            </div>

            {/* Market Cards */}
            <ScrollArea className="h-[700px] pr-4">
              <div className="space-y-3">
                {filteredAndSortedData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No tokens found matching your filters</p>
                  </div>
                ) : (
                  filteredAndSortedData.map((item) => (
                    <MarketCard
                      key={`${item.source}-${item.id}`}
                      id={item.id}
                      name={item.name}
                      symbol={item.symbol}
                      image={item.image}
                      price={item.price}
                      change24h={item.change24h}
                      volume24h={item.volume24h}
                      marketCap={item.marketCap}
                      source={item.source}
                      rank={item.rank}
                      isFavorite={favorites.has(item.id)}
                      onToggleFavorite={toggleFavorite}
                      onViewDetails={() => {
                        setSelectedToken(item);
                        setDetailDialogOpen(true);
                      }}
                    />
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer Info */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Live updates every 10s • Update #{updateCount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Powered by:</span>
                  <Badge variant="outline" className="text-[10px]">CoinGecko</Badge>
                  <Badge variant="outline" className="text-[10px]">OKX</Badge>
                  <Badge variant="default" className="text-[10px]">🚀 MoonShot</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TokenDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        token={selectedToken}
      />

      <TelegramNavigation />
    </div>
  );
};

export default Markets;
