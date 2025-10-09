import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { AIMarketAnalysis } from "@/components/AIMarketAnalysis";

interface TokenDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: {
    id: string;
    name: string;
    symbol: string;
    image?: string;
    price: number;
    change24h: number;
    volume24h: number;
    marketCap?: number;
    source: string;
  } | null;
}

export const TokenDetailDialog = ({ open, onOpenChange, token }: TokenDetailDialogProps) => {
  if (!token) return null;

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const marketData = {
    price: token.price,
    change24h: token.change24h,
    volume24h: token.volume24h,
    marketCap: token.marketCap,
    source: token.source,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {token.image && (
              <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span>{token.name}</span>
                <Badge variant="secondary">{token.symbol.toUpperCase()}</Badge>
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                via {token.source}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Price</p>
              </div>
              <p className="text-xl font-bold">{formatPrice(token.price)}</p>
            </div>

            <div className="p-4 bg-card rounded-xl border">
              <div className="flex items-center gap-2 mb-2">
                {token.change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <p className="text-xs text-muted-foreground">24h Change</p>
              </div>
              <p className={`text-xl font-bold ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Volume 24h</p>
              </div>
              <p className="text-xl font-bold">{formatVolume(token.volume24h)}</p>
            </div>

            {token.marketCap && (
              <div className="p-4 bg-card rounded-xl border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Market Cap</p>
                </div>
                <p className="text-xl font-bold">{formatVolume(token.marketCap)}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* AI Analysis */}
          <AIMarketAnalysis
            tokenAddress={token.id}
            tokenSymbol={token.symbol}
            marketData={marketData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};