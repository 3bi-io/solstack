import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NetworkStatusProps {
  compact?: boolean;
}

export const NetworkStatus = ({ compact = false }: NetworkStatusProps) => {
  const { connection } = useConnection();
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState<string>("Devnet");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await connection.getVersion();
        setIsConnected(true);
        
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
      } catch (error) {
        console.error("Solana RPC connection error:", error);
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [connection]);

  if (compact) {
    return (
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className={cn(
          "gap-1 h-7",
          isConnected && "bg-accent/20 text-accent border-accent/30"
        )}
      >
        {isConnected ? (
          <Wifi className="w-3 h-3 animate-pulse" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className={cn(
          "gap-1.5 h-8 px-3 transition-all",
          isConnected && "bg-gradient-to-r from-accent/20 to-primary/20 text-accent border-accent/30 hover:from-accent/30 hover:to-primary/30"
        )}
      >
        {isConnected ? (
          <>
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-xs font-semibold">{network}</span>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Offline</span>
          </>
        )}
      </Badge>
    </div>
  );
};
