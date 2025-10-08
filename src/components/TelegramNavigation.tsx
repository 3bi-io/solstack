import { useNavigate, useLocation } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { Rocket, BarChart3, Gift, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/WalletConnectButton";

const navItems = [
  { icon: Rocket, label: "Launch", path: "/launch" },
  { icon: BarChart3, label: "Transactions", path: "/transactions" },
  { icon: Gift, label: "Airdrop", path: "/airdrop" },
  { icon: FileText, label: "Logs", path: "/logs" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

export const TelegramNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticFeedback } = useTelegram();

  const handleNavigation = (path: string) => {
    hapticFeedback.impact("light");
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-2xl mx-auto px-2 py-2">
        {/* Wallet Connection */}
        <div className="flex justify-center mb-2">
          <WalletConnectButton />
        </div>
        
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
