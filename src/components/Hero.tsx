import { Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { UserMenu } from "@/components/UserMenu";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-6">
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
      
      {/* User Menu */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu />
      </div>
      
      <div className="relative z-10 px-6 sm:px-8 py-12 sm:py-16 text-center">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="text-7xl sm:text-8xl animate-pulse drop-shadow-2xl">
              🤖
            </div>
            {/* Glow effect behind emoji */}
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full -z-10 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
          ProTools Bundler
        </h1>
        
        <p className="text-muted-foreground text-lg sm:text-xl mb-6 max-w-2xl mx-auto px-4 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
          The ultimate Solana toolkit for token launches, airdrops, and transaction management
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:text-base">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full backdrop-blur-sm hover:bg-primary/20 transition-all hover-scale animate-fade-in border border-primary/20" style={{ animationDelay: '0.2s' }}>
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full backdrop-blur-sm hover:bg-primary/20 transition-all hover-scale animate-fade-in border border-primary/20" style={{ animationDelay: '0.3s' }}>
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Blockchain Verified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full backdrop-blur-sm hover:bg-primary/20 transition-all hover-scale animate-fade-in border border-primary/20" style={{ animationDelay: '0.4s' }}>
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Solana API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
