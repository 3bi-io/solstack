import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BalanceDropdownHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const BalanceDropdownHeader = ({ isLoading, onRefresh }: BalanceDropdownHeaderProps) => {
  return (
    <>
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
            onRefresh();
          }}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        </Button>
      </div>
      <DropdownMenuSeparator />
    </>
  );
};
