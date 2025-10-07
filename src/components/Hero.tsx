import { Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import bundlerLogo from "@/assets/bundler-logo.png";

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
      
      <div className="relative z-10 px-6 py-12 text-center">
        <div className="flex justify-center mb-4">
          <img src={bundlerLogo} alt="Bundler Logo" className="w-20 h-20 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          ProTools Bundler
        </h1>
        <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
          Optimize your transactions with advanced bundling technology
        </p>
        <div className="flex items-center justify-center gap-2 text-accent">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Lightning Fast • Secure • Efficient</span>
        </div>
      </div>
    </div>
  );
};
