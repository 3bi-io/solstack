import { Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import heroLogo from "@/assets/hero-logo-transparent.png";
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
          <img 
            src={heroLogo} 
            alt="ProTools Bundler" 
            className="w-20 h-20 sm:w-24 sm:h-24 animate-pulse drop-shadow-2xl" 
          />
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
          ProTools Bundler
        </h1>
        
        <p className="text-muted-foreground text-lg sm:text-xl mb-6 max-w-2xl mx-auto px-4 leading-relaxed">
          The ultimate Solana toolkit for token launches, airdrops, and transaction management
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Blockchain Verified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
