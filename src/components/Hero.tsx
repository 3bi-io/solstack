import { Zap } from "lucide-react";
import solstackLogo from "@/assets/solstack-logo.png";
import heroBackground from "@/assets/hero-background.jpeg";
import { UserMenu } from "@/components/UserMenu";
import { NetworkStatus } from "@/components/NetworkStatus";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-6">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBackground})`,
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
      
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 text-center">
        <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
          <div className="relative">
            <img 
              src={solstackLogo} 
              alt="SOLSTACK Logo" 
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 drop-shadow-2xl object-contain rounded-2xl liquid-flow"
            />
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full -z-10 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in px-2">
          SOLSTACK
        </h1>
        
        <div className="mb-2 sm:mb-3 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-primary/20 border border-primary/30 rounded-full text-xs sm:text-sm font-semibold text-primary-foreground">
            The Official solstack.me
          </span>
        </div>
        
        <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 max-w-2xl mx-auto px-4 leading-relaxed animate-fade-in text-muted-foreground" style={{ animationDelay: '0.1s' }}>
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
