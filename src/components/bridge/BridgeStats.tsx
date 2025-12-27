import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftRight, 
  Users, 
  TrendingUp, 
  Clock,
  Activity
} from "lucide-react";

interface BridgeStat {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
}

const BRIDGE_STATS: BridgeStat[] = [
  {
    label: "24h Volume",
    value: "$2.4M",
    change: "+12.5%",
    positive: true,
    icon: <ArrowLeftRight className="w-4 h-4 text-accent" />,
  },
  {
    label: "Total Bridged",
    value: "$156M",
    change: "+5.2%",
    positive: true,
    icon: <TrendingUp className="w-4 h-4 text-green-500" />,
  },
  {
    label: "Unique Users",
    value: "12,450",
    change: "+324",
    positive: true,
    icon: <Users className="w-4 h-4 text-primary" />,
  },
  {
    label: "Avg. Bridge Time",
    value: "28s",
    change: "-2s",
    positive: true,
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
  },
];

export const BridgeStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {BRIDGE_STATS.map((stat) => (
        <Card key={stat.label} className="p-4 bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-2">
            {stat.icon}
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold font-mono">{stat.value}</p>
            {stat.change && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  stat.positive 
                    ? 'text-green-500 border-green-500/30' 
                    : 'text-red-500 border-red-500/30'
                }`}
              >
                {stat.change}
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
