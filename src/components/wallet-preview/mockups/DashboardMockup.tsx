import { PhoneMockup } from "../PhoneMockup";
import { TrendingUp, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const DashboardMockup = () => {
  return (
    <PhoneMockup>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground">Portfolio</h3>
          <Eye className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Balance */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <h2 className="text-4xl font-black mb-2">$47,329.84</h2>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-semibold">+12.5%</span>
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="p-4 bg-gradient-to-r from-primary to-accent rounded-2xl text-left">
            <ArrowUpRight className="w-5 h-5 mb-2" />
            <span className="text-sm font-semibold">Send</span>
          </button>
          <button className="p-4 bg-card/50 border border-primary/20 rounded-2xl text-left">
            <ArrowDownRight className="w-5 h-5 mb-2" />
            <span className="text-sm font-semibold">Receive</span>
          </button>
        </div>

        {/* Assets */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-3">Assets</h4>
          <div className="space-y-3">
            {[
              { name: "SOL", amount: "124.5", value: "$18,450", change: "+5.2%" },
              { name: "USDC", amount: "15,320", value: "$15,320", change: "+0.1%" },
              { name: "BONK", amount: "2.5M", value: "$13,559", change: "+18.3%" }
            ].map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-card/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full" />
                  <div>
                    <p className="font-semibold text-sm">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{asset.value}</p>
                  <p className="text-xs text-green-500">{asset.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};
