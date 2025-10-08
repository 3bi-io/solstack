import { useNavigate, useLocation } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { Rocket, BarChart3, Gift, TrendingUp, Repeat, Settings, TreePine, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, HelpCircle } from "lucide-react";

const mainNavItems = [
  { icon: Rocket, label: "Launch", path: "/launch" },
  { icon: BarChart3, label: "Transactions", path: "/transactions" },
  { icon: Gift, label: "Airdrop", path: "/airdrop" },
  { icon: TrendingUp, label: "Analytics", path: "/analytics" },
  { icon: Repeat, label: "Swap", path: "/swap" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const moreNavItems = [
  { icon: TreePine, label: "Merkle", path: "/merkle-airdrop" },
  { icon: Shield, label: "MultiSig", path: "/multisig" },
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
        
        <div className="grid grid-cols-6 gap-1">
          {mainNavItems.map((item) => {
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
          
          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col gap-1 h-auto py-2"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="text-[10px]">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="cursor-pointer"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
