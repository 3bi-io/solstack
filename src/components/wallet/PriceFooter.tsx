import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export const PriceFooter = () => {
  return (
    <>
      <DropdownMenuSeparator />
      <div className="px-3 py-2 text-center">
        <p className="text-[10px] text-muted-foreground">
          Prices from CoinGecko • Updates every 2 min
        </p>
      </div>
    </>
  );
};
