import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnect = () => {
    // Simulate wallet connection
    const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
    setWalletAddress(mockAddress);
    setIsConnected(true);
    toast.success("Wallet connected successfully!");
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    toast.info("Wallet disconnected");
  };

  if (isConnected) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Wallet Connected</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/30">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10 animate-pulse">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              To start bundling transactions, please connect your crypto wallet
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 max-w-sm mx-auto">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span>Supported: MetaMask, WalletConnect, and more</span>
          </div>
          <Button variant="gradient" size="lg" onClick={handleConnect} className="w-full max-w-xs">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
