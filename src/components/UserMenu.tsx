import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, LogOut, Settings, Activity, LogIn, TrendingUp, 
  Rocket, Send, Wallet, ArrowLeftRight, Key, 
  DollarSign, Users, FileText, HelpCircle, Shield,
  GitMerge, Gift
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { WalletConnectButton } from "./WalletConnectButton";
import { useAdminCheck } from "@/hooks/useAdminCheck";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Use secure admin check hook instead of client-side state
  const { isAdmin } = useAdminCheck();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hide wallet button on mobile - it's in bottom nav */}
      <div className="hidden sm:block">
        <WalletConnectButton />
      </div>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all group relative overflow-hidden h-9 w-9 sm:h-10 sm:w-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <User className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:text-primary transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-primary/20 shadow-xl z-[100]" sideOffset={8}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Markets & Trading</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/markets")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Live Markets</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/swap")}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              <span>Swap</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Token & Airdrop</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/launch")}>
              <Rocket className="mr-2 h-4 w-4" />
              <span>Launch Token</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/airdrop")}>
              <Send className="mr-2 h-4 w-4" />
              <span>Airdrop</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/merkle-airdrop")}>
              <Gift className="mr-2 h-4 w-4" />
              <span>Merkle Airdrop</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Wallet & Assets</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/wallet")}>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Wallet</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/multisig")}>
              <GitMerge className="mr-2 h-4 w-4" />
              <span>MultiSig</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/transactions")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Transactions</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Account & Settings</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/analytics")}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/api-keys")}>
              <Key className="mr-2 h-4 w-4" />
              <span>API Keys</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/referrals")}>
              <Users className="mr-2 h-4 w-4" />
              <span>Referrals</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/billing")}>
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Admin</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/logs")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>System Logs</span>
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/help")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
};
