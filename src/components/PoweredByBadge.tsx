import { useState, useEffect, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "powered-by-badge-position";
const MIN_TOUCH_TARGET = 44; // Minimum touch target size in pixels

export const PoweredByBadge = () => {
  const [position, setPosition] = useState<Position>({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef<Position & { time: number }>({ x: 0, y: 0, time: 0 });
  const animationFrameRef = useRef<number>();

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

  const constrainPosition = (x: number, y: number): Position => {
    const maxX = window.innerWidth - (badgeRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (badgeRef.current?.offsetHeight || 0);
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!badgeRef.current) return;
    
    const rect = badgeRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    lastPositionRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!badgeRef.current) return;
    
    const touch = e.touches[0];
    const rect = badgeRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    lastPositionRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setIsDragging(true);
  };

  // Handle momentum/inertia after drag release
  useEffect(() => {
    if (isDragging || velocity.x === 0 && velocity.y === 0) return;

    let currentVelocity = { ...velocity };
    const friction = 0.92;
    const minVelocity = 0.5;

    const animate = () => {
      if (Math.abs(currentVelocity.x) < minVelocity && Math.abs(currentVelocity.y) < minVelocity) {
        setVelocity({ x: 0, y: 0 });
        return;
      }

      currentVelocity = {
        x: currentVelocity.x * friction,
        y: currentVelocity.y * friction,
      };

      setPosition(prev => {
        const newPos = constrainPosition(
          prev.x + currentVelocity.x,
          prev.y + currentVelocity.y
        );
        savePosition(newPos);
        return newPos;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, velocity]);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const now = Date.now();
      const dt = now - lastPositionRef.current.time;

      if (dt > 0) {
        const vx = (clientX - lastPositionRef.current.x) / dt * 16;
        const vy = (clientY - lastPositionRef.current.y) / dt * 16;
        setVelocity({ x: vx, y: vy });
      }

      lastPositionRef.current = { x: clientX, y: clientY, time: now };

      const newPos = constrainPosition(
        clientX - dragOffset.x,
        clientY - dragOffset.y
      );
      setPosition(newPos);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        savePosition(position);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove, { passive: false });
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [isDragging, dragOffset, position]);

  return (
    <div
      ref={badgeRef}
      className={`fixed z-50 touch-none animate-fade-in ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: `${MIN_TOUCH_TARGET}px`,
        minHeight: `${MIN_TOUCH_TARGET}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="relative group">
        <div 
          className={`absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur transition-all duration-300 ${
            isDragging ? "opacity-80 blur-lg" : "opacity-30 group-hover:opacity-60"
          }`} 
        />
        <div 
          className={`relative px-4 sm:px-6 py-2 sm:py-2.5 bg-background/95 backdrop-blur-sm border border-primary/40 rounded-full transition-all duration-200 ${
            isDragging ? "scale-105 shadow-2xl border-primary/60" : "group-hover:scale-102"
          }`}
        >
          <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap tracking-wide select-none pointer-events-none">
            Powered by <span className="text-primary">Cᴏᴅʏ Fᴏʀʙᴇꜱ</span>
          </span>
        </div>
      </div>
    </div>
  );
};
