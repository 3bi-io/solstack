import { PhoneMockup } from "../PhoneMockup";
import { TrendingUp, Coins } from "lucide-react";

export const StakingMockup = () => {
  return (
    <PhoneMockup>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-xl font-black mb-2">Staking Rewards</h3>
          <p className="text-sm text-muted-foreground">Earn passive income on your assets</p>
        </div>

        {/* Total Staked */}
        <div className="mb-6 p-6 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Staked</span>
          </div>
          <h2 className="text-3xl font-black mb-2">$28,450.00</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Est. APY:</span>
            <span className="text-green-500 font-bold">7.2%</span>
          </div>
        </div>

        {/* Staking Opportunities */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-4">Available Pools</h4>
          <div className="space-y-3">
            {[
              { name: "SOL", apy: "7.2%", staked: "$18,450", validator: "Marinade" },
              { name: "mSOL", apy: "8.5%", staked: "$5,800", validator: "Jito" },
              { name: "USDC", apy: "12.3%", staked: "$4,200", validator: "Kamino" }
            ].map((pool, i) => (
              <div key={i} className="p-4 bg-card/40 border border-primary/10 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full" />
                    <div>
                      <p className="font-bold text-sm">{pool.name}</p>
                      <p className="text-xs text-muted-foreground">{pool.validator}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-500 font-bold text-sm">{pool.apy}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">APY</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Staked: {pool.staked}</span>
                  <button className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent rounded-lg text-xs font-semibold">
                    Stake More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="p-3 bg-card/30 rounded-xl text-center">
            <p className="text-xs text-muted-foreground mb-1">Earned Today</p>
            <p className="font-bold text-green-500">+$12.84</p>
          </div>
          <div className="p-3 bg-card/30 rounded-xl text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
            <p className="font-bold text-green-500">+$2,450.23</p>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};
