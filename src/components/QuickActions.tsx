import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Gift, BarChart3, Wallet, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useFeedback } from "@/contexts/FeedbackContext";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { openFeedback } = useFeedback();

  const actions = [
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
    {
      icon: Wallet,
      title: "Connect Wallet",
      description: "Link your Solana wallet",
      path: "/wallet",
      gradient: "from-yellow-500/10 to-orange-500/10",
      requiresWallet: false,
    },
  ];

  const handleAction = (action: typeof actions[0]) => {
    if (action.requiresWallet && !isConnected) {
      openFeedback();
      return;
    }
    navigate(action.path);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Quick Actions</h2>
        {isConnected && (
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
            Wallet Connected
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Card
            key={action.title}
            className={`p-4 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br ${action.gradient} border-primary/10`}
            onClick={() => handleAction(action)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-background/80 rounded-lg">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
