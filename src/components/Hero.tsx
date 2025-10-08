import { Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import bundlerLogo from "@/assets/bundler-logo.png";
import { UserMenu } from "@/components/UserMenu";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>
      </div>
      
      {/* User Menu */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu />
      </div>
      
      <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 text-center">
        <div className="flex justify-center mb-3 sm:mb-4">
          <img src={bundlerLogo} alt="Bundler Logo" className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          ProTools Bundler
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6 max-w-md mx-auto px-4">
          Optimize your transactions with advanced bundling technology
        </p>
        <div className="flex items-center justify-center gap-2 text-accent">
          <Zap className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium">Lightning Fast • Secure • Efficient</span>
        </div>
      </div>
    </div>
  );
};
