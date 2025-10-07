import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useFeedback } from "@/contexts/FeedbackContext";

const Wallet = () => {
  const { hapticFeedback } = useTelegram();
  const { openFeedback } = useFeedback();

  const handleConnect = () => {
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
                <WalletIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Wallet Connection</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Connect and manage your wallets
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleConnect} className="w-full">
              <WalletIcon className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-xs">No wallets connected yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Wallet;
