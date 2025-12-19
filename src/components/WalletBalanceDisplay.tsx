import { Wallet, RefreshCw, ChevronDown, Coins, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useCoinGeckoPrices, formatUsd } from '@/hooks/useCoinGeckoPrices';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface WalletBalanceDisplayProps {
  compact?: boolean;
}

export const WalletBalanceDisplay = ({ compact = false }: WalletBalanceDisplayProps) => {
  const { connected } = useWallet();
  const { sol, solFormatted, tokens, isLoading: balanceLoading, refresh: refreshBalance } = useWalletBalance();
  const { solPrice, sol24hChange, isLoading: priceLoading, refresh: refreshPrice } = useCoinGeckoPrices();

  const isLoading = balanceLoading || priceLoading;
  const solUsdValue = solPrice ? sol * solPrice : null;

  const handleRefresh = () => {
    refreshBalance();
    refreshPrice();
  };

  if (!connected) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">
        <Wallet className="h-3.5 w-3.5 text-primary" />
        {isLoading ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium text-foreground">
              {solFormatted} SOL
            </span>
            {solUsdValue !== null && (
              <span className="text-[10px] text-muted-foreground">
                {formatUsd(solUsdValue)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-card/50 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wallet className="h-3 w-3 text-primary-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-sm leading-none">{solFormatted} SOL</span>
                {solUsdValue !== null && (
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    ≈ {formatUsd(solUsdValue)}
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-card/95 backdrop-blur-xl border-primary/20"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Wallet Balance
          </DropdownMenuLabel>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              handleRefresh();
            }}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Total Portfolio Value */}
        {solUsdValue !== null && (
          <>
            <div className="px-3 py-2 bg-primary/5 mx-2 rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Portfolio Value</p>
                  <p className="text-lg font-bold text-foreground">{formatUsd(solUsdValue)}</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* SOL Balance */}
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                <span className="text-white font-bold text-xs">SOL</span>
              </div>
              <div>
                <p className="font-medium">Solana</p>
                <p className="text-xs text-muted-foreground">Native Token</p>
              </div>
            </div>
            <div className="text-right">
              {balanceLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <>
                  <p className="font-semibold">{solFormatted}</p>
                  {solUsdValue !== null && (
                    <p className="text-xs text-green-500 flex items-center justify-end gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {formatUsd(solUsdValue)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* SOL Price Info */}
          {solPrice && (
            <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>SOL Price</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">${solPrice.toFixed(2)}</span>
                {sol24hChange !== null && (
                  <span className={cn(
                    "flex items-center gap-0.5 font-medium",
                    sol24hChange >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {sol24hChange >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {sol24hChange >= 0 ? '+' : ''}{sol24hChange.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Token Balances */}
        {tokens.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Coins className="h-3 w-3" />
                SPL Tokens ({tokens.length})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tokens.map((token) => (
                  <div 
                    key={token.mint} 
                    className="flex items-center justify-between py-1.5 px-2 rounded-md bg-background/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-primary">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {token.mint.slice(0, 6)}...
                      </code>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {token.uiBalance}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {tokens.length === 0 && !balanceLoading && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-3 text-center">
              <p className="text-xs text-muted-foreground">No SPL tokens found</p>
            </div>
          </>
        )}
        
        {/* Price Source */}
        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            Prices from CoinGecko • Updates every 2 min
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
