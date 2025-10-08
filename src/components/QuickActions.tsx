import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Gift, BarChart3, Wallet, ArrowRight, Lock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/contexts/AuthContext";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { user } = useAuth();

  const actions = [
    {
      icon: TrendingUp,
      title: "Live Markets",
      description: "Real-time crypto market data",
      path: "/markets",
      gradient: "from-accent/10 to-primary/10",
      requiresWallet: false,
    },
    {
      icon: Rocket,
      title: "Launch Token",
      description: "Create SPL tokens on Solana",
      path: "/launch",
      gradient: "from-blue-500/10 to-purple-500/10",
      requiresWallet: true,
    },
    {
      icon: Gift,
      title: "Airdrop",
      description: "Distribute tokens to holders",
      path: "/airdrop",
      gradient: "from-pink-500/10 to-red-500/10",
      requiresWallet: true,
    },
    {
      icon: BarChart3,
      title: "Transactions",
      description: "View your activity",
      path: "/transactions",
      gradient: "from-green-500/10 to-teal-500/10",
      requiresWallet: true,
    },
  ];

  const handleAction = (action: typeof actions[0]) => {
    navigate(action.path);
  };

  if (!user) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-bold">Quick Actions</h2>
        </div>
        <Card className="p-6 sm:p-8 text-center border-primary/20">
          <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sign in to get started</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create an account or sign in to access all platform features
          </p>
          <Button onClick={() => navigate("/auth")}>
            Sign In / Sign Up
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-bold">Quick Actions</h2>
        <div className="flex items-center gap-2">
          {connected && (
            <span className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-accent/10 text-accent rounded-full whitespace-nowrap">
              Wallet Connected
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => (
          <Card
            key={action.title}
            className={`p-4 sm:p-5 cursor-pointer active:scale-95 md:hover:scale-105 transition-all bg-gradient-to-br ${action.gradient} border-primary/10 touch-manipulation min-h-[80px]`}
            onClick={() => handleAction(action)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 sm:p-2.5 bg-background/80 rounded-lg flex-shrink-0">
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base mb-1">{action.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
