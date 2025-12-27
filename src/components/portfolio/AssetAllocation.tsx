import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatUsd } from "@/lib/utils";

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  percentage: number;
  change24h: number;
  color: string;
}

interface AssetAllocationProps {
  assets: PortfolioAsset[];
  isLoading: boolean;
}

export function AssetAllocation({ assets, isLoading }: AssetAllocationProps) {
  const sortedAssets = [...assets].sort((a, b) => b.usdValue - a.usdValue);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-primary" />
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No assets found. Connect your wallet to view allocation.
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sortedAssets}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="usdValue"
                  nameKey="symbol"
                >
                  {sortedAssets.map((asset, index) => (
                    <Cell key={`cell-${index}`} fill={asset.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [formatUsd(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Asset List */}
            <div className="space-y-2">
              {sortedAssets.slice(0, 5).map((asset) => (
                <div 
                  key={asset.symbol}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: asset.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatUsd(asset.usdValue)}</p>
                    <p className={`text-xs ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
              
              {assets.length > 5 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  + {assets.length - 5} more assets
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
