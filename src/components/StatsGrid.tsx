import { Card, CardContent } from "@/components/ui/card";
import { Activity, DollarSign, TrendingUp, Users } from "lucide-react";

const stats = [
  {
    title: "Total Bundles",
    value: "15,843",
    icon: Activity,
    trend: "+12.5%",
  },
  {
    title: "Gas Saved",
    value: "$2.4K",
    icon: DollarSign,
    trend: "+8.2%",
  },
  {
    title: "Success Rate",
    value: "99.8%",
    icon: TrendingUp,
    trend: "+0.3%",
  },
  {
    title: "Active Users",
    value: "456",
    icon: Users,
    trend: "+18.7%",
  },
];

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-start justify-between mb-2 sm:mb-2.5">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 flex-shrink-0">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="text-[10px] sm:text-xs text-accent font-semibold whitespace-nowrap">{stat.trend}</span>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
