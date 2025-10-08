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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdminStatus();
  }, [user]);

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
      <WalletConnectButton />
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <User className="h-5 w-5 relative z-10 group-hover:text-primary transition-colors" />
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
            <DropdownMenuItem onClick={() => navigate("/launch-coin")}>
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
      ) : (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300" />
          <Button 
            variant="default"
            size="sm"
            onClick={() => navigate("/auth")}
            className="relative bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all shadow-lg hover:shadow-primary/50 gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        </div>
      )}
    </div>
  );
};
