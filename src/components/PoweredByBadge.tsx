import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";

interface PoweredByBadgeProps {
  onTransform: () => void;
}

export const PoweredByBadge = ({ onTransform }: PoweredByBadgeProps) => {
  const isMobile = useIsMobile();
  const [isTransforming, setIsTransforming] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setIsTransforming(true);
    
    // After animation completes, trigger the chatbot
    setTimeout(() => {
      setIsVisible(false);
      onTransform();
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-6 right-6'} z-50 cursor-pointer animate-fade-in transition-all duration-600 ease-out ${
        isTransforming ? 'scale-90 opacity-0' : ''
      }`}
      onClick={handleClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleClick();
      }}
      style={{
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {!isTransforming ? (
        <div className="relative group">
          <div 
            className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur opacity-30 group-hover:opacity-60 transition-all duration-300" 
          />
          <div 
            className="relative px-4 sm:px-6 py-2 sm:py-2.5 bg-background/95 backdrop-blur-sm border border-primary/40 rounded-full transition-all duration-200 group-hover:scale-105"
          >
            <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap tracking-wide select-none">
              Powered by <span className="text-primary">Cᴏᴅʏ Fᴏʀʙᴇꜱ</span>
            </span>
          </div>
        </div>
      ) : (
        <div className={`${isMobile ? 'h-16 w-16' : 'h-14 w-14'} rounded-full shadow-lg flex items-center justify-center bg-gradient-to-r from-primary via-accent to-primary`}>
          <div className="relative">
            <div className="absolute -inset-1 bg-white/20 rounded-full blur" />
            <Sparkles className="relative h-8 w-8 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};