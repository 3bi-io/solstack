import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Shield, AlertTriangle, CheckCircle, AlertCircle, Brain } from "lucide-react";

interface RiskAnalysis {
  level: 'Low' | 'Med' | 'High';
  score: number;
  factors: string[];
  summary: string;
}

interface MarketRiskOverviewProps {
  riskScores: Record<string, RiskAnalysis>;
  totalTokens: number;
  isAnalyzing: boolean;
  source: 'ai' | 'heuristic' | null;
}

export const MarketRiskOverview = ({ riskScores, totalTokens, isAnalyzing, source }: MarketRiskOverviewProps) => {
  const riskDistribution = useMemo(() => {
    const scores = Object.values(riskScores);
    const low = scores.filter(s => s.level === 'Low').length;
    const med = scores.filter(s => s.level === 'Med').length;
    const high = scores.filter(s => s.level === 'High').length;
    
    return [
      { name: 'Low Risk', value: low, color: 'hsl(142, 76%, 36%)', icon: CheckCircle },
      { name: 'Medium Risk', value: med, color: 'hsl(45, 93%, 47%)', icon: AlertCircle },
      { name: 'High Risk', value: high, color: 'hsl(0, 84%, 60%)', icon: AlertTriangle },
    ].filter(item => item.value > 0);
  }, [riskScores]);

  const avgRiskScore = useMemo(() => {
    const scores = Object.values(riskScores);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  }, [riskScores]);

  const analyzedCount = Object.keys(riskScores).length;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Market Risk Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <Badge variant="outline" className="gap-1 animate-pulse">
                <Brain className="w-3 h-3" />
                Analyzing...
              </Badge>
            )}
            {source && (
              <Badge variant={source === 'ai' ? 'default' : 'secondary'} className="gap-1">
                {source === 'ai' ? <Brain className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                {source === 'ai' ? 'AI Powered' : 'Heuristic'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <div className="w-36 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} tokens`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground">Tokens Analyzed</p>
                <p className="text-2xl font-bold">{analyzedCount}/{totalTokens}</p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground">Avg Risk Score</p>
                <p className={`text-2xl font-bold ${
                  avgRiskScore < 35 ? 'text-green-500' : 
                  avgRiskScore < 65 ? 'text-yellow-500' : 
                  'text-red-500'
                }`}>
                  {avgRiskScore}/100
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-xs text-muted-foreground">
                    {item.name}: <span className="font-semibold text-foreground">{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
