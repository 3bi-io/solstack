import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Shield, AlertTriangle, TrendingUp, Activity, Droplets, Users, Lock } from "lucide-react";

interface RiskAnalysis {
  level: 'Low' | 'Med' | 'High';
  score: number;
  factors: string[];
  summary: string;
}

interface RiskBreakdownChartProps {
  riskAnalysis: RiskAnalysis | null;
  tokenSymbol: string;
  isLoading?: boolean;
}

export const RiskBreakdownChart = ({ riskAnalysis, tokenSymbol, isLoading }: RiskBreakdownChartProps) => {
  const riskColor = useMemo(() => {
    if (!riskAnalysis) return "hsl(var(--muted))";
    switch (riskAnalysis.level) {
      case 'Low': return "hsl(142, 76%, 36%)";
      case 'Med': return "hsl(45, 93%, 47%)";
      case 'High': return "hsl(0, 84%, 60%)";
      default: return "hsl(var(--muted))";
    }
  }, [riskAnalysis]);

  const riskBreakdown = useMemo(() => {
    if (!riskAnalysis) return [];
    
    const score = riskAnalysis.score;
    const factors = riskAnalysis.factors;
    
    // Generate breakdown based on risk factors
    const breakdown = [
      {
        name: "Volatility",
        value: factors.some(f => f.toLowerCase().includes('volatil')) ? Math.min(100, score + 20) : Math.max(0, score - 10),
        icon: Activity,
        description: "Price movement stability"
      },
      {
        name: "Liquidity",
        value: factors.some(f => f.toLowerCase().includes('liquidity') || f.toLowerCase().includes('volume')) 
          ? (factors.some(f => f.toLowerCase().includes('high')) ? 25 : 75)
          : 50,
        icon: Droplets,
        description: "Trading volume depth"
      },
      {
        name: "Contract",
        value: factors.some(f => f.toLowerCase().includes('contract') || f.toLowerCase().includes('suspicious')) ? 80 : 20,
        icon: Lock,
        description: "Smart contract safety"
      },
      {
        name: "Distribution",
        value: factors.some(f => f.toLowerCase().includes('holder') || f.toLowerCase().includes('distribution')) ? 60 : 35,
        icon: Users,
        description: "Token holder spread"
      },
    ];
    
    return breakdown;
  }, [riskAnalysis]);

  const pieData = useMemo(() => {
    if (!riskAnalysis) return [];
    const score = riskAnalysis.score;
    return [
      { name: "Risk", value: score, color: riskColor },
      { name: "Safe", value: 100 - score, color: "hsl(var(--muted))" }
    ];
  }, [riskAnalysis, riskColor]);

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 animate-pulse" />
            Analyzing {tokenSymbol}...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskAnalysis) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            No risk data available
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: riskColor }} />
            AI Risk Analysis
          </CardTitle>
          <Badge 
            variant={riskAnalysis.level === 'Low' ? 'default' : riskAnalysis.level === 'Med' ? 'secondary' : 'destructive'}
            className="gap-1"
          >
            {riskAnalysis.level === 'High' && <AlertTriangle className="w-3 h-3" />}
            {riskAnalysis.level === 'Low' && <TrendingUp className="w-3 h-3" />}
            {riskAnalysis.level} Risk • {riskAnalysis.score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pie Chart */}
        <div className="flex items-center gap-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-muted-foreground">{riskAnalysis.summary}</p>
            <div className="flex flex-wrap gap-1">
              {riskAnalysis.factors.map((factor, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Factor Bars */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risk Factors</h4>
          {riskBreakdown.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <item.icon className="w-3 h-3 text-muted-foreground" />
                  <span>{item.name}</span>
                </div>
                <span className={
                  item.value > 60 ? "text-red-500" : 
                  item.value > 40 ? "text-yellow-500" : 
                  "text-green-500"
                }>
                  {item.value}%
                </span>
              </div>
              <Progress 
                value={item.value} 
                className="h-1.5"
              />
              <p className="text-[10px] text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
