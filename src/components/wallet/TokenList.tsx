import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { TokenBalance } from '@/types/wallet';

interface TokenListProps {
  tokens: TokenBalance[];
  isLoading: boolean;
}

export const TokenList = ({ tokens, isLoading }: TokenListProps) => {
  if (isLoading) return null;

  if (tokens.length === 0) {
    return (
      <>
        <DropdownMenuSeparator />
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-muted-foreground">No SPL tokens found</p>
        </div>
      </>
    );
  }

  return (
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
  );
};
