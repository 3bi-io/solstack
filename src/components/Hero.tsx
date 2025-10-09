import heroBackground from "@/assets/hero-background.jpeg";
import { HeroLogo, HeroTitle, HeroDescription, HeroFeatures } from "./hero";

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
      
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 text-center">
        <HeroLogo />
        <HeroTitle />
        <HeroDescription />
        <HeroFeatures />
      </div>
    </div>
  );
};
