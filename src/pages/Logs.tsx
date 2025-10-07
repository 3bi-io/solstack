import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useFeedback } from "@/contexts/FeedbackContext";

const Logs = () => {
  const { hapticFeedback } = useTelegram();
  const { openFeedback } = useFeedback();

  const handleViewLogs = () => {
    hapticFeedback.impact("medium");
    openFeedback();
  };
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Activity Logs</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View your activity history
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No activity logs yet</p>
              <p className="text-xs mt-1 mb-4">Your activity will be logged here</p>
              <Button onClick={handleViewLogs} size="sm">
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Logs;
