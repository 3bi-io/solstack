import { useState, useEffect, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

export const PoweredByBadge = () => {
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Initialize position to bottom-right
  useEffect(() => {
    if (badgeRef.current) {
      const badge = badgeRef.current;
      badge.style.right = '16px';
      badge.style.bottom = '16px';
    }
  }, []);

  const handleClick = () => {
    if (isDisappearing || !badgeRef.current) return;
    
    setIsDisappearing(true);
    
    // Calculate center position
    const badge = badgeRef.current;
    const rect = badge.getBoundingClientRect();
    const centerX = (window.innerWidth / 2) - (rect.width / 2);
    const centerY = (window.innerHeight / 2) - (rect.height / 2);
    
    // Move to center
    badge.style.left = `${centerX}px`;
    badge.style.top = `${centerY}px`;
    badge.style.right = 'auto';
    badge.style.bottom = 'auto';
    
    // Hide after animation completes
    setTimeout(() => {
      setIsVisible(false);
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={badgeRef}
      className="fixed z-50 animate-fade-in cursor-pointer"
      style={{
        transition: isDisappearing ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease-out' : 'none',
        opacity: isDisappearing ? 0 : 1,
      }}
      onClick={handleClick}
      onTouchEnd={handleClick}
    >
      <div className="relative group">
        <div 
          className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur transition-all duration-300 opacity-30 group-hover:opacity-60" 
        />
        <div 
          className="relative px-4 sm:px-6 py-2 sm:py-2.5 bg-background/95 backdrop-blur-sm border border-primary/40 rounded-full transition-all duration-200 group-hover:scale-102"
        >
          <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap tracking-wide select-none">
            Powered by <span className="text-primary">Cᴏᴅʏ Fᴏʀʙᴇꜱ</span>
          </span>
        </div>
      </div>
    </div>
  );
};
