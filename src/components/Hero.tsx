import { Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { UserMenu } from "@/components/UserMenu";
import { NetworkStatus } from "@/components/NetworkStatus";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-6">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background"></div>
      </div>
      
      {/* Network Status - Top left */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
        <NetworkStatus />
      </div>
      
      {/* User Menu - Optimized for mobile */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <UserMenu />
      </div>
      
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 sm:mb-4 md:mb-5 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in px-2 tracking-tight">
          SOLSTACK
        </h1>
        
        <div className="mb-4 sm:mb-5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <span className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-primary/20 border border-primary/30 rounded-full text-sm sm:text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20">
            The Official solstack.me
          </span>
        </div>
        
        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed animate-fade-in text-muted-foreground font-medium" style={{ animationDelay: '0.1s' }}>
          The official Solana toolkit for token launches, airdrops, and transaction management
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base px-2">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full backdrop-blur-sm hover:bg-primary/20 transition-all hover-scale animate-fade-in border border-primary/20" style={{ animationDelay: '0.2s' }}>
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">Official Platform</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full backdrop-blur-sm hover:bg-primary/20 transition-all hover-scale animate-fade-in border border-primary/20" style={{ animationDelay: '0.3s' }}>
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">Blockchain Verified</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full backdrop-blur-sm hover:bg-primary/20 transition-all hover-scale animate-fade-in border border-primary/20" style={{ animationDelay: '0.4s' }}>
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">Trusted by Thousands</span>
          </div>
        </div>
      </div>
    </div>
  );
};
