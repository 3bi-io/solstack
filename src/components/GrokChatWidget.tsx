import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Send, Minimize2, Maximize2, Sparkles, Move } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Position {
  x: number;
  y: number;
}

const CHAT_POSITION_KEY = "grok-chat-position";

export const GrokChatWidget = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your xAI-powered crypto assistant. Ask me anything about cryptocurrency, blockchain, DeFi, or market analysis!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Drag functionality
  const [position, setPosition] = useState<Position>({ x: 24, y: 96 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef<Position & { time: number }>({ x: 0, y: 0, time: 0 });
  const animationFrameRef = useRef<number>();

  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_POSITION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch (e) {
        console.error("Failed to load chat position:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const savePosition = (pos: Position) => {
    localStorage.setItem(CHAT_POSITION_KEY, JSON.stringify(pos));
  };

  const constrainPosition = (x: number, y: number): Position => {
    const maxX = window.innerWidth - (chatRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (chatRef.current?.offsetHeight || 0);
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    };
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!chatRef.current || isMinimized) return;
    
    const rect = chatRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    lastPositionRef.current = { x: clientX, y: clientY, time: Date.now() };
    setIsDragging(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('grok-chat', {
        body: { messages: [...messages, userMessage] }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.message) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response from server');
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.message 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("Failed to get response. Please try again.");
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ChatMessages = () => (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ChatInput = () => (
    <div className="p-4 border-t bg-background">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about crypto..."
          disabled={isLoading}
          className="flex-1 h-12"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-12 w-12"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className={`fixed ${isMobile ? 'bottom-20 right-4 h-16 w-16' : 'bottom-24 right-6 h-14 w-14'} rounded-full shadow-lg hover:scale-110 transition-transform z-50`}
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur opacity-75 animate-pulse" />
          <Sparkles className="relative h-8 w-8" />
        </div>
      </Button>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/20 rounded-lg blur" />
                <Sparkles className="relative h-6 w-6" />
              </div>
              <SheetTitle className="text-primary-foreground">xAI Crypto Assistant</SheetTitle>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <ChatMessages />
          </ScrollArea>
          <ChatInput />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card 
      ref={chatRef}
      className={`fixed touch-none w-96 shadow-2xl z-50 flex flex-col overflow-hidden ${
        isMinimized ? 'h-14' : 'h-[600px]'
      } ${isDragging ? 'cursor-grabbing scale-105' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      <div 
        className={`flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground ${
          !isMinimized ? 'cursor-grab' : ''
        }`}
        onMouseDown={!isMinimized ? handleMouseDown : undefined}
        onTouchStart={!isMinimized ? handleTouchStart : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-white/20 rounded-lg blur" />
            <Sparkles className="relative h-5 w-5" />
          </div>
          <span className="font-semibold select-none">xAI Crypto Assistant</span>
          {!isMinimized && <Move className="h-4 w-4 opacity-60" />}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0 hover:bg-white/20 text-primary-foreground"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 hover:bg-white/20 text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <ChatMessages />
          </ScrollArea>
          <ChatInput />
        </>
      )}
    </Card>
  );
};
