import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useFeedback } from "@/contexts/FeedbackContext";

const Transactions = () => {
  const { hapticFeedback } = useTelegram();
  const { openFeedback } = useFeedback();

  const handleViewTransactions = () => {
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
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Transactions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Track your transaction history
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1 mb-4">Your transaction history will appear here</p>
              <Button onClick={handleViewTransactions} size="sm">
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

export default Transactions;
