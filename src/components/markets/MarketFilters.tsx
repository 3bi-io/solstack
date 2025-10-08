import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  Star,
  Flame,
} from "lucide-react";

export type FilterCategory = "all" | "favorites" | "gainers" | "losers" | "trending";
export type FilterExchange = "all" | "coingecko" | "okx" | "coinbase";

interface MarketFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  exchange: FilterExchange;
  onExchangeChange: (exchange: FilterExchange) => void;
  resultsCount: number;
}

export const MarketFilters = ({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  exchange,
  onExchangeChange,
  resultsCount,
}: MarketFiltersProps) => {
  const categories = [
    { value: "all" as const, label: "All Markets", icon: Filter },
    { value: "favorites" as const, label: "Favorites", icon: Star },
    { value: "gainers" as const, label: "Top Gainers", icon: TrendingUp },
    { value: "losers" as const, label: "Top Losers", icon: TrendingDown },
    { value: "trending" as const, label: "Trending", icon: Flame },
  ];

  const hasActiveFilters = searchQuery || category !== "all" || exchange !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onExchangeChange("all");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or symbol..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={category === value ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(value)}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Exchange Filter & Results */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Source:</span>
          <Select value={exchange} onValueChange={(v) => onExchangeChange(v as FilterExchange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="coingecko">CoinGecko</SelectItem>
              <SelectItem value="okx">OKX</SelectItem>
              <SelectItem value="coinbase">Coinbase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="w-3 h-3" />
              Clear Filters
            </Button>
          )}
          <Badge variant="secondary" className="gap-1">
            <Filter className="w-3 h-3" />
            {resultsCount} results
          </Badge>
        </div>
      </div>
    </div>
  );
};
