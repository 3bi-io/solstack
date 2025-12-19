import { DollarSign } from 'lucide-react';
import { formatUsd } from '@/lib/utils';

interface PortfolioValueProps {
  value: number;
}

export const PortfolioValue = ({ value }: PortfolioValueProps) => {
  return (
    <div className="px-3 py-2 bg-primary/5 mx-2 rounded-lg mb-2">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Portfolio Value</p>
          <p className="text-lg font-bold text-foreground">{formatUsd(value)}</p>
        </div>
      </div>
    </div>
  );
};
