import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NetworkStatusProps {
  compact?: boolean;
}

type ConnectionStatus = "connected" | "disconnected" | "degraded";

export const NetworkStatus = ({ compact = false }: NetworkStatusProps) => {
  const { connection } = useConnection();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [network, setNetwork] = useState<string>("Mainnet");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await connection.getVersion();
        setStatus("connected");
        
        // Detect network from RPC endpoint
        const endpoint = connection.rpcEndpoint;
        if (endpoint.includes("mainnet")) {
          setNetwork("Mainnet");
        } else if (endpoint.includes("devnet")) {
          setNetwork("Devnet");
        } else if (endpoint.includes("testnet")) {
          setNetwork("Testnet");
        } else {
          setNetwork("Custom");
        }
      } catch (error: any) {
        console.error("Solana RPC connection error:", error);
        
        // Check if it's a rate limit/403 error vs actual network issue
        if (error?.message?.includes("403") || error?.message?.includes("forbidden")) {
          setStatus("degraded");
        } else {
          setStatus("disconnected");
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [connection]);

  if (compact) {
    return (
      <Badge 
        variant={status === "connected" ? "default" : "destructive"}
        className={cn(
          "gap-1 h-7",
          status === "connected" && "bg-accent/20 text-accent border-accent/30",
          status === "degraded" && "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
        )}
      >
        {status === "connected" ? (
          <Wifi className="w-3 h-3 animate-pulse" />
        ) : status === "degraded" ? (
          <AlertCircle className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
      </Badge>
    );
  }

  const statusConfig = {
    connected: {
      icon: Activity,
      label: network,
      bgClass: "bg-gradient-to-r from-accent/20 to-primary/20 text-accent border-accent/30",
      hoverClass: "hover:from-accent/30 hover:to-primary/30",
      indicator: "bg-accent",
    },
    degraded: {
      icon: AlertCircle,
      label: "Limited",
      bgClass: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      hoverClass: "hover:bg-yellow-500/30",
      indicator: "bg-yellow-500",
    },
    disconnected: {
      icon: WifiOff,
      label: "Setup Required",
      bgClass: "bg-destructive/20 text-destructive border-destructive/30",
      hoverClass: "hover:bg-destructive/30",
      indicator: "bg-destructive",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="default"
        className={cn(
          "gap-1.5 h-8 px-3 transition-all",
          config.bgClass,
          config.hoverClass
        )}
        title={
          status === "degraded" 
            ? "Using public RPC (rate limited). Configure your own RPC endpoint for full functionality."
            : status === "disconnected"
            ? "RPC endpoint not configured. See SOLANA_SETUP.md for instructions."
            : `Connected to Solana ${network}`
        }
      >
        <config.icon className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-xs font-semibold">{config.label}</span>
        <div className={cn("w-2 h-2 rounded-full animate-pulse", config.indicator)} />
      </Badge>
    </div>
  );
};
