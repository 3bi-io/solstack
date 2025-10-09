import { Brain, TrendingUp, Zap } from "lucide-react";

interface FeaturePillProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  delay: string;
  animated?: boolean;
}

const FeaturePill = ({ icon: Icon, label, delay, animated = false }: FeaturePillProps) => {
  return (
    <div 
      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full backdrop-blur-sm hover:bg-primary/20 transition-all hover-scale animate-fade-in border border-primary/30 shadow-lg shadow-primary/10" 
      style={{ animationDelay: delay }}
    >
      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0 ${animated ? 'animate-pulse' : ''}`} />
      <span className="font-medium whitespace-nowrap">{label}</span>
    </div>
  );
};

export const HeroFeatures = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base px-2">
      <FeaturePill 
        icon={Brain} 
        label="AI Market Analysis" 
        delay="0.2s"
        animated
      />
      <FeaturePill 
        icon={TrendingUp} 
        label="Smart Trading" 
        delay="0.3s"
      />
      <FeaturePill 
        icon={Zap} 
        label="Lightning Fast" 
        delay="0.4s"
      />
    </div>
  );
};
