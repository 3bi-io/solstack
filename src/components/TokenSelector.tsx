import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Token, POPULAR_TOKENS } from "@/lib/jupiter";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  disabled?: boolean;
}

export function TokenSelector({
  selectedToken,
  onSelectToken,
  disabled = false,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-32 justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedToken.logoURI && (
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="font-semibold">{selectedToken.symbol}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search tokens..." />
          <CommandEmpty>No token found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {POPULAR_TOKENS.map((token) => (
              <CommandItem
                key={token.address}
                value={token.symbol}
                onSelect={() => {
                  onSelectToken(token);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {token.name}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedToken.address === token.address
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
