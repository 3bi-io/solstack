import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { Brain, Users, Sparkles, Gift, Activity } from "lucide-react";

const features = [
  { icon: Sparkles, text: "Real Solana Blockchain Integration" },
  { icon: Brain, text: "Intelligent Transaction Bundling" },
  { icon: Users, text: "Multi-Recipient Airdrops" },
  { icon: Gift, text: "SPL Token Creation & Management" },
  { icon: Activity, text: "Real-time Transaction Tracking" },
];

export const WelcomeMessage = () => {
  const { user, isInTelegram } = useTelegram();

  return (
    <Card className="p-6 bg-gradient-to-br from-card/90 to-card/70 border-primary/20 backdrop-blur-sm">
      <div className="space-y-4">
        {isInTelegram && user && (
          <div className="text-center pb-4 border-b border-border/50">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Welcome back, {user.first_name}! 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              Your comprehensive Solana bundling platform
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Platform Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
