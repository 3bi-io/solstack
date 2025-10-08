import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export const NetworkStatus = () => {
  const { connection } = useConnection();
  const [isMainnet, setIsMainnet] = useState(false);
  const [networkHealth, setNetworkHealth] = useState<"healthy" | "degraded" | "unknown">("unknown");

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const endpoint = connection.rpcEndpoint;
        setIsMainnet(endpoint.includes('mainnet'));
        
        // Simple health check
        await connection.getSlot();
        setNetworkHealth("healthy");
      } catch (error) {
        setNetworkHealth("degraded");
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [connection]);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isMainnet ? "destructive" : "secondary"}
        className="text-xs"
      >
        {isMainnet ? "Mainnet" : "Devnet"}
      </Badge>
      
      {networkHealth === "healthy" ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : networkHealth === "degraded" ? (
        <AlertCircle className="h-4 w-4 text-yellow-500" />
      ) : null}
    </div>
  );
};
