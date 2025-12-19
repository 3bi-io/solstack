import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUsd } from '@/lib/utils';

interface BalanceCompactViewProps {
  solFormatted: string;
  solUsdValue: number | null;
  isLoading: boolean;
}

export const BalanceCompactView = ({ 
  solFormatted, 
  solUsdValue, 
  isLoading 
}: BalanceCompactViewProps) => {
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
};
