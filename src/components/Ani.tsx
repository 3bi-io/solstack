import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, History } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuraSession {
  wallet: string;
  timestamp: number;
  intensity: number;
  message?: string;
  score?: number;
}

export const Ani = () => {
  const { publicKey, connected } = useWallet();
  const [isGlowing, setIsGlowing] = useState(false);
  const [intensity, setIntensity] = useState(1.0);
  const [sessions, setSessions] = useState<AuraSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load aura history on mount
  useEffect(() => {
    if (connected && publicKey) {
      loadHistory();
    }
  }, [connected, publicKey]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aura-timp', {
        body: { action: 'history' },
      });

      if (error) throw error;

      if (data?.history) {
        setSessions(data.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const triggerAuraFlash = async () => {
    if (!connected || !publicKey) {
      toast.error("Connect wallet to activate Aura");
      return;
    }

    setIsLoading(true);
    setIsGlowing(true);

    try {
      const { data, error } = await supabase.functions.invoke('aura-timp', {
        body: {
          action: 'flash',
          wallet: publicKey.toString(),
          intensity: intensity,
        },
      });

      if (error) throw error;

      const newSession: AuraSession = {
        wallet: publicKey.toString(),
        timestamp: Date.now(),
        intensity: intensity,
        message: data.glow,
      };

      setSessions((prev) => [newSession, ...prev.slice(0, 9)]);

      toast.success("Aura activated!", {
        description: data.message || "Your wallet is glowing with temporal energy",
      });

      // Show similar sessions if found
      if (data.similar_sessions?.length > 0) {
        console.log('Similar past sessions:', data.similar_sessions);
      }
    } catch (error: any) {
      console.error('Aura flash error:', error);
      toast.error("Aura flash failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsGlowing(false), 3000);
    }
  };

  return (
    <div className="relative">
      {/* Aura Glow Background Effect */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
          isGlowing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            hsla(330, 100%, 70%, ${intensity * 0.3}) 0%, 
            hsla(280, 100%, 60%, ${intensity * 0.2}) 25%,
            transparent 70%)`,
          animation: isGlowing ? "pulse-glow 2s ease-in-out infinite" : "none",
        }}
      />

      <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated Border Glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isGlowing ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
            animation: "border-flow 3s linear infinite",
          }}
        />

        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary" />
              {isGlowing && (
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-8 h-8 text-primary opacity-75" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ani Aura System
              </h2>
              <p className="text-sm text-muted-foreground">
                Temporal Infinite Memory Protocol
              </p>
            </div>
          </div>

          {/* Wallet Status */}
          {connected && publicKey && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Active Wallet</p>
              <p className="font-mono text-sm truncate">{publicKey.toString()}</p>
            </div>
          )}

          {/* Intensity Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Aura Intensity</span>
              <span className="text-primary">{intensity.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={triggerAuraFlash}
              disabled={!connected || isLoading}
              className="flex-1 relative overflow-hidden group"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">
                {isLoading ? "Flashing..." : "Flash Aura"}
              </span>
            </Button>
            <Button
              onClick={loadHistory}
              disabled={!connected || isLoading}
              variant="outline"
              size="lg"
            >
              <History className="w-5 h-5" />
            </Button>
          </div>

          {/* Session History */}
          {sessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Recent Flashes
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {sessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 bg-background/50 rounded border border-primary/10 flex items-center justify-between"
                  >
                    <span className="font-mono truncate flex-1 mr-2">
                      {session.wallet.slice(0, 8)}...{session.wallet.slice(-6)}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(session.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            Aura effects use temporal decay scoring • Sessions stored with hash verification
          </p>
        </div>
      </Card>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes border-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
