import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Star,
  ArrowRightLeft,
  ExternalLink,
  Bell,
  Share2,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface MarketCardProps {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  source: "coingecko" | "okx" | "coinbase";
  rank?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const MarketCard = ({
  id,
  name,
  symbol,
  image,
  price,
  change24h,
  volume24h,
  marketCap,
  source,
  rank,
  isFavorite = false,
  onToggleFavorite,
}: MarketCardProps) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  const handleTrade = () => {
    navigate(`/swap?token=${symbol}`);
  };

  const handleSetAlert = () => {
    toast({
      title: "Price Alert Set",
      description: `You'll be notified about ${symbol.toUpperCase()} price changes`,
    });
  };

  const handleShare = async () => {
    const text = `Check out ${name} (${symbol.toUpperCase()}) - $${price.toFixed(2)} ${change24h >= 0 ? '📈' : '📉'} ${change24h.toFixed(2)}%`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} Market Data`,
          text,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Market data copied successfully",
      });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (price < 0.01) {
      return price.toFixed(8);
    }
    return price.toFixed(4);
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between p-4">
        {/* Left: Token Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {rank && (
            <span className="text-xs text-muted-foreground font-mono w-8 flex-shrink-0">
              #{rank}
            </span>
          )}
          
          <div className="relative">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-10 h-10 rounded-full flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">{symbol.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <Badge
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-4 px-1 text-[8px]"
            >
              {source}
            </Badge>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg truncate">
                {symbol.toUpperCase()}
              </p>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onToggleFavorite(id)}
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFavorite ? "fill-yellow-500 text-yellow-500" : ""
                    }`}
                  />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{name}</p>
          </div>
        </div>

        {/* Right: Price & Change */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="font-bold text-lg whitespace-nowrap">
              ${formatPrice(price)}
            </p>
            <p className="text-xs text-muted-foreground">
              Vol: ${(volume24h / 1e6).toFixed(2)}M
            </p>
            {marketCap && (
              <p className="text-xs text-muted-foreground">
                MCap: ${(marketCap / 1e9).toFixed(2)}B
              </p>
            )}
          </div>
          <Badge
            variant={change24h >= 0 ? "default" : "destructive"}
            className="min-w-[80px] justify-center gap-1 px-3 py-1"
          >
            {change24h >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-bold">
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          </Badge>
        </div>
      </div>

      {/* Action Buttons (shown on hover) */}
      <div
        className={`flex gap-2 p-3 pt-0 border-t border-border/50 bg-muted/20 transition-all ${
          showActions ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        <Button
          size="sm"
          className="flex-1 gap-1"
          onClick={handleTrade}
        >
          <ArrowRightLeft className="w-3 h-3" />
          Trade
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSetAlert}
          className="gap-1"
        >
          <Bell className="w-3 h-3" />
          Alert
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleShare}
          className="gap-1"
        >
          <Share2 className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          asChild
          className="gap-1"
        >
          <a
            href={`https://www.coingecko.com/en/coins/${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
    </Card>
  );
};
