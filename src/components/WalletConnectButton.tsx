import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, Check, ExternalLink, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export const WalletConnectButton = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      toast({
        title: "Address copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExplorer = () => {
    if (publicKey) {
      window.open(
        `https://solscan.io/account/${publicKey.toBase58()}`,
        "_blank"
      );
    }
  };

  if (connected && publicKey) {
    const address = publicKey.toBase58();
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <Wallet className="h-4 w-4 text-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
              </div>
              <span className="font-mono text-xs sm:text-sm font-semibold">
                <span className="hidden sm:inline">{address.slice(0, 4)}...{address.slice(-4)}</span>
                <span className="sm:hidden">{address.slice(0, 3)}...</span>
              </span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-accent/20 text-accent">
                Connected
              </Badge>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-card/95 backdrop-blur-xl border-primary/20 shadow-xl z-[100]"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Wallet Address
          </DropdownMenuLabel>
          <div className="px-2 py-2">
            <div className="p-3 bg-muted/50 rounded-lg border border-primary/10">
              <p className="font-mono text-xs break-all text-foreground/90">
                {address}
              </p>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleCopy}
            className="gap-2 cursor-pointer hover:bg-primary/10"
          >
            {copied ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? "Copied!" : "Copy Address"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleExplorer}
            className="gap-2 cursor-pointer hover:bg-primary/10"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Solscan</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="gap-2 cursor-pointer text-destructive hover:bg-destructive/10"
          >
            <Wallet className="w-4 h-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300 animate-pulse" />
      <div className="relative">
        <WalletMultiButton className="!bg-gradient-to-r !from-primary !to-accent hover:!from-primary/90 hover:!to-accent/90 !transition-all !duration-300 !shadow-lg hover:!shadow-primary/50 !border-0 !min-h-[38px] !h-auto !py-2 !px-4" />
      </div>
    </div>
  );
};
