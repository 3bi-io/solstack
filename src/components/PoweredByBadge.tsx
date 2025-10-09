import { useState, useEffect, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "powered-by-badge-position";

export const PoweredByBadge = () => {
  const [position, setPosition] = useState<Position>({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

  // Load saved position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch (e) {
        console.error("Failed to load badge position:", e);
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = (pos: Position) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!badgeRef.current) return;
    
    const rect = badgeRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!badgeRef.current) return;
    
    const touch = e.touches[0];
    const rect = badgeRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep badge within viewport bounds
      const maxX = window.innerWidth - (badgeRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (badgeRef.current?.offsetHeight || 0);

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: boundedX, y: boundedY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;

      // Keep badge within viewport bounds
      const maxX = window.innerWidth - (badgeRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (badgeRef.current?.offsetHeight || 0);

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        savePosition(position);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  return (
    <div
      ref={badgeRef}
      className={`fixed z-50 animate-fade-in ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300 ${isDragging ? "opacity-75" : ""}`} />
        <div className={`relative px-4 sm:px-6 py-2 sm:py-2.5 bg-background/95 backdrop-blur-sm border border-primary/40 rounded-full transition-all ${isDragging ? "scale-105" : ""}`}>
          <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap tracking-wide select-none">
            Powered by <span className="text-primary">Cᴏᴅʏ Fᴏʀʙᴇꜱ</span>
          </span>
        </div>
      </div>
    </div>
  );
};
