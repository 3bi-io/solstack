import { useState } from "react";

export const PoweredByBadge = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 cursor-pointer animate-fade-in"
      onClick={handleClick}
      onTouchEnd={handleClick}
    >
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
    </div>
  );
};
