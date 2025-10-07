import { useEffect } from "react";
import { Hero } from "@/components/Hero";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { StatsGrid } from "@/components/StatsGrid";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { useTelegram } from "@/hooks/useTelegram";

const Index = () => {
  const { isInTelegram, hapticFeedback } = useTelegram();

  useEffect(() => {
    if (isInTelegram) {
      hapticFeedback.impact("soft");
    }
  }, [isInTelegram, hapticFeedback]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Hero />
        <div className="space-y-4 sm:space-y-6 mt-4">
          <WelcomeMessage />
          <StatsGrid />
        </div>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Index;
