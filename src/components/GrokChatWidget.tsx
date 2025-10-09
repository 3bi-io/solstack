import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Send, Minimize2, Maximize2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
        className={`fixed ${isMobile ? 'bottom-4 right-4 h-16 w-16' : 'bottom-6 right-6 h-14 w-14'} rounded-full shadow-lg hover:scale-110 transition-transform z-50`}
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
      className={`fixed bottom-6 right-6 w-96 shadow-2xl z-50 flex flex-col transition-all overflow-hidden ${
        isMinimized ? 'h-14' : 'h-[600px]'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-white/20 rounded-lg blur" />
            <Sparkles className="relative h-5 w-5" />
          </div>
          <span className="font-semibold">xAI Crypto Assistant</span>
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
