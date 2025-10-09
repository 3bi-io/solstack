import { Sparkles } from "lucide-react";

export const HeroDescription = () => {
  return (
    <>
      <div className="mb-2 sm:mb-3 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 rounded-full text-xs sm:text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          First Ever AI-Powered DeFi Platform
        </span>
      </div>
      
      <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 max-w-3xl mx-auto px-4 leading-relaxed animate-fade-in text-muted-foreground" style={{ animationDelay: '0.1s' }}>
        Experience the cutting edge of <span className="text-primary font-semibold">AI-driven Solana trading</span>. Revolutionary token launches, intelligent market analysis, and automated DeFi strategies powered by advanced machine learning.
      </p>
    </>
  );
};
