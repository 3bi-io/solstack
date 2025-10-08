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
import { User, LogOut, Settings, Activity, LogIn, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { WalletConnectButton } from "./WalletConnectButton";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/markets")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Live Markets</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/analytics")}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/auth")}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      )}
    </div>
  );
};
