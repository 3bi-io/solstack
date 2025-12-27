import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface RiskAnalysis {
  level: 'Low' | 'Med' | 'High';
  score: number;
  factors: string[];
  summary: string;
}

interface RiskTrendChartProps {
  riskAnalysis: RiskAnalysis | null;
  tokenSymbol: string;
  priceChange24h: number;
}

export const RiskTrendChart = ({ riskAnalysis, tokenSymbol, priceChange24h }: RiskTrendChartProps) => {
  // Generate simulated historical risk trend data based on current analysis
  const trendData = useMemo(() => {
    if (!riskAnalysis) return [];
    
    const baseScore = riskAnalysis.score;
    const volatilityFactor = Math.abs(priceChange24h) / 10;
    const hours = ['24h ago', '20h ago', '16h ago', '12h ago', '8h ago', '4h ago', 'Now'];
    
    return hours.map((time, index) => {
      // Simulate historical values with some variance
      const variance = (Math.random() - 0.5) * 15 * volatilityFactor;
      const historicalScore = Math.max(0, Math.min(100, 
        baseScore + variance - (6 - index) * (priceChange24h > 0 ? 2 : -2)
      ));
      
      return {
        time,
        riskScore: index === hours.length - 1 ? baseScore : Math.round(historicalScore),
        priceImpact: index === hours.length - 1 ? priceChange24h : priceChange24h * (index / 6),
      };
    });
  }, [riskAnalysis, priceChange24h]);

  const riskTrend = useMemo(() => {
    if (trendData.length < 2) return 'stable';
    const first = trendData[0]?.riskScore || 0;
    const last = trendData[trendData.length - 1]?.riskScore || 0;
    const diff = last - first;
    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }, [trendData]);

  const getRiskColor = (score: number) => {
    if (score < 35) return "hsl(142, 76%, 36%)";
    if (score < 65) return "hsl(45, 93%, 47%)";
    return "hsl(0, 84%, 60%)";
  };

  if (!riskAnalysis) {
    return null;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            24h Risk Trend
          </CardTitle>
          <Badge 
            variant={riskTrend === 'decreasing' ? 'default' : riskTrend === 'stable' ? 'secondary' : 'destructive'}
            className="gap-1"
          >
            {riskTrend === 'increasing' && <TrendingUp className="w-3 h-3" />}
            {riskTrend === 'decreasing' && <TrendingDown className="w-3 h-3" />}
            {riskTrend === 'increasing' ? 'Risk Increasing' : 
             riskTrend === 'decreasing' ? 'Risk Decreasing' : 
             'Stable'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getRiskColor(riskAnalysis.score)} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getRiskColor(riskAnalysis.score)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value}`, 'Risk Score']}
              />
              <Area 
                type="monotone" 
                dataKey="riskScore" 
                stroke={getRiskColor(riskAnalysis.score)}
                strokeWidth={2}
                fill="url(#riskGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Risk Level Zones */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Low (0-35)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Med (35-65)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">High (65+)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
