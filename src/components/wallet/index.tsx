import { Wallet, ChevronDown } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useSolPrice } from '@/hooks/useSolPrice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUsd } from '@/lib/utils';
import type { WalletBalanceDisplayProps } from '@/types/wallet';

import { BalanceCompactView } from './BalanceCompactView';
import { BalanceDropdownHeader } from './BalanceDropdownHeader';
import { PortfolioValue } from './PortfolioValue';
import { SolBalanceCard } from './SolBalanceCard';
import { TokenList } from './TokenList';
import { PriceFooter } from './PriceFooter';

export const WalletBalanceDisplay = ({ compact = false }: WalletBalanceDisplayProps) => {
  const { connected } = useWallet();
  const { sol, solFormatted, tokens, isLoading: balanceLoading, refresh: refreshBalance } = useWalletBalance();
  const { solPrice, sol24hChange, isLoading: priceLoading, refresh: refreshPrice } = useSolPrice();

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
      <BalanceCompactView
        solFormatted={solFormatted}
        solUsdValue={solUsdValue}
        isLoading={isLoading}
      />
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
        <BalanceDropdownHeader isLoading={isLoading} onRefresh={handleRefresh} />

        {solUsdValue !== null && <PortfolioValue value={solUsdValue} />}

        <SolBalanceCard
          solFormatted={solFormatted}
          solUsdValue={solUsdValue}
          solPrice={solPrice}
          sol24hChange={sol24hChange}
          isLoading={balanceLoading}
        />

        <TokenList tokens={tokens} isLoading={balanceLoading} />

        <PriceFooter />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
