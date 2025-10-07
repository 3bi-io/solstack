import { useState } from "react";
import { Hero } from "@/components/Hero";
import { StatsGrid } from "@/components/StatsGrid";
import { BundlerInterface } from "@/components/BundlerInterface";
import { RecentBundles } from "@/components/RecentBundles";
import { FeedbackDialog } from "@/components/FeedbackDialog";

const Index = () => {
  const [showFeedback, setShowFeedback] = useState(true);
  const [feedbackWasClosed, setFeedbackWasClosed] = useState(false);

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
      <FeedbackDialog open={showFeedback} onClose={handleCloseFeedback} />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Hero />
        <StatsGrid />
        <div className="space-y-6">
          <BundlerInterface onCtaClick={handleCtaClick} />
          <RecentBundles />
        </div>
      </div>
    </div>
  );
};

export default Index;
