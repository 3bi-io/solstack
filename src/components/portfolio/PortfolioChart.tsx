import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { formatUsd } from "@/lib/utils";

interface PortfolioHistory {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  history: PortfolioHistory[];
  isLoading: boolean;
}

export function PortfolioChart({ history, isLoading }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const filteredData = (() => {
    switch (timeRange) {
      case '7d':
        return history.slice(-7);
      case '90d':
        return history; // We only have 30 days of mock data
      default:
        return history;
    }
  })();

  const minValue = Math.min(...filteredData.map(d => d.value)) * 0.95;
  const maxValue = Math.max(...filteredData.map(d => d.value)) * 1.05;

  const isPositive = filteredData.length >= 2 && 
    filteredData[filteredData.length - 1].value >= filteredData[0].value;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Portfolio Performance
        </CardTitle>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-2 h-6">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2 h-6">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2 h-6">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositive ? '#10b981' : '#ef4444'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? '#10b981' : '#ef4444'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3} 
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => formatUsd(value)}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [formatUsd(value), 'Portfolio Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                fill="url(#portfolioGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
