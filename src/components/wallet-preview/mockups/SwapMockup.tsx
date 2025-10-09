import { PhoneMockup } from "../PhoneMockup";
import { ArrowDownUp, Settings2, Sparkles } from "lucide-react";

export const SwapMockup = () => {
  return (
    <PhoneMockup>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black">Swap</h3>
          <Settings2 className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* AI Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <p className="text-sm">AI found better rate on Jupiter</p>
        </div>

        {/* From */}
        <div className="mb-4 p-5 bg-card/40 border border-primary/20 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-xs text-muted-foreground">Balance: 124.5</span>
          </div>
          <div className="flex justify-between items-center">
            <input 
              type="text" 
              value="50.0" 
              readOnly
              className="bg-transparent text-2xl font-bold w-full outline-none"
            />
            <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full" />
              <span className="font-semibold">SOL</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">≈ $7,410.00</p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button className="p-3 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg">
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>

        {/* To */}
        <div className="mb-6 p-5 bg-card/40 border border-primary/20 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">To</span>
            <span className="text-xs text-muted-foreground">Balance: 15,320</span>
          </div>
          <div className="flex justify-between items-center">
            <input 
              type="text" 
              value="7,425.82" 
              readOnly
              className="bg-transparent text-2xl font-bold w-full outline-none"
            />
            <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl">
              <div className="w-6 h-6 bg-blue-500 rounded-full" />
              <span className="font-semibold">USDC</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">≈ $7,425.82</p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6 p-4 bg-card/20 rounded-xl">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-semibold">1 SOL = 148.52 USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fee</span>
            <span className="font-semibold text-green-500">$0.00 (0%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Route</span>
            <span className="font-semibold">Jupiter</span>
          </div>
        </div>

        {/* Swap Button */}
        <button className="w-full p-4 bg-gradient-to-r from-primary to-accent rounded-2xl font-bold text-lg shadow-xl">
          Swap Now
        </button>
      </div>
    </PhoneMockup>
  );
};
