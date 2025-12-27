import { HeroLogo, HeroTitle, HeroDescription, HeroFeatures } from "./hero";
import { MempoolParticles } from "./MempoolParticles";
import { DashboardPreview } from "./DashboardPreview";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center">
      {/* Deep purple-black gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Animated mempool particles */}
      <MempoolParticles />
      
      {/* Radial glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 text-center w-full max-w-6xl mx-auto">
        <HeroLogo />
        <HeroTitle />
        <HeroDescription />
        <HeroFeatures />
        
        {/* Dashboard Preview */}
        <DashboardPreview />
      </div>
    </div>
  );
};
