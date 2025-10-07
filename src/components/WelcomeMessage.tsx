import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, BarChart2, Gift, Search } from "lucide-react";

const features = [
  { icon: Brain, text: "Intelligent Auto-Bundling" },
  { icon: MessageSquare, text: "Fake Comments Generator" },
  { icon: BarChart2, text: "Volume Bot Assistant" },
  { icon: Gift, text: "Airdrop Management" },
  { icon: Search, text: "Transaction Tracker & More" },
];

export const WelcomeMessage = () => {
  const { user, isInTelegram } = useTelegram();

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-card/80 to-card/60 border-primary/20">
      <div className="space-y-4">
        {isInTelegram && user && (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              Welcome, {user.first_name}! 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              Your all-in-one crypto bundler assistant
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary">Features:</h3>
          <div className="space-y-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-accent" />
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
