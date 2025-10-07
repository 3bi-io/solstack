import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { StatsGrid } from "@/components/StatsGrid";
import { BundlerInterface } from "@/components/BundlerInterface";
import { RecentBundles } from "@/components/RecentBundles";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useTelegram } from "@/hooks/useTelegram";

const Index = () => {
  const { user, isInTelegram, hapticFeedback } = useTelegram();
  const [showFeedback, setShowFeedback] = useState(true);
  const [feedbackWasClosed, setFeedbackWasClosed] = useState(false);

  useEffect(() => {
    // Show a subtle haptic feedback when app loads in Telegram
    if (isInTelegram) {
      hapticFeedback.impact("soft");
    }
  }, [isInTelegram, hapticFeedback]);

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    setFeedbackWasClosed(true);
  };

  const handleCtaClick = () => {
    if (feedbackWasClosed) {
      setShowFeedback(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FeedbackDialog 
        open={showFeedback} 
        onClose={handleCloseFeedback}
        telegramUser={user}
      />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Hero />
        {isInTelegram && user && (
          <div className="mb-4 p-2.5 sm:p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs sm:text-sm">
              Welcome, <span className="font-semibold">{user.first_name}</span>! 👋
            </p>
          </div>
        )}
        <StatsGrid />
        <div className="space-y-4 sm:space-y-6">
          <BundlerInterface onCtaClick={handleCtaClick} />
          <RecentBundles />
        </div>
      </div>
    </div>
  );
};

export default Index;
