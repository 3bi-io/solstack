import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { Brain, Users, Sparkles, Gift, Activity } from "lucide-react";

const features = [
  { icon: Sparkles, text: "Solana Developers API" },
  { icon: Brain, text: "Intelligent Transaction Bundling" },
  { icon: Users, text: "Multi-Recipient Airdrops" },
  { icon: Gift, text: "SPL Token Creation & Management" },
  { icon: Activity, text: "Real-time Transaction Tracking" },
];

export const WelcomeMessage = () => {
  const { user, isInTelegram } = useTelegram();

  return (
    <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-card/90 to-card/70 border-primary/20 backdrop-blur-sm">
      <div className="space-y-3 sm:space-y-4">
        {isInTelegram && user && (
          <div className="text-center pb-3 sm:pb-4 border-b border-border/50">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2">
              Welcome back, {user.first_name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your comprehensive Solana bundling platform
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold text-primary flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Platform Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-lg bg-background/50 hover:bg-background/80 transition-colors active:scale-95 touch-manipulation min-h-[56px]"
                >
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium leading-tight">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
