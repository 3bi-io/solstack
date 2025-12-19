import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatUsd } from '@/lib/utils';

interface SolBalanceCardProps {
  solFormatted: string;
  solUsdValue: number | null;
  solPrice: number | null;
  sol24hChange: number | null;
  isLoading: boolean;
}

export const SolBalanceCard = ({
  solFormatted,
  solUsdValue,
  solPrice,
  sol24hChange,
  isLoading,
}: SolBalanceCardProps) => {
  return (
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
          {isLoading ? (
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
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium',
                  sol24hChange >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {sol24hChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {sol24hChange >= 0 ? '+' : ''}
                {sol24hChange.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
