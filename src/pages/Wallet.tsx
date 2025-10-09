import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, CheckCircle2, XCircle } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useWallet } from "@/contexts/WalletContext";
import { Badge } from "@/components/ui/badge";

const Wallet = () => {
  const { hapticFeedback } = useTelegram();
  const { openFeedback } = useFeedback();
  const { isConnected, disconnectWallet } = useWallet();

  const handleConnect = () => {
    hapticFeedback.impact("medium");
    openFeedback();
  };

  const handleDisconnect = () => {
    hapticFeedback.impact("medium");
    disconnectWallet();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <WalletIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg sm:text-xl">Wallet Connection</CardTitle>
                  {isConnected && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {isConnected ? "Your wallet is connected and all features are enabled" : "Connect and manage your wallets"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">Wallet Connected</h3>
                      <p className="text-xs text-muted-foreground">
                        Your wallet is successfully connected. You now have full access to all features including:
                      </p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                        <li>Launch new coins</li>
                        <li>View transaction history</li>
                        <li>Manage airdrops</li>
                        <li>Access logs and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button onClick={handleDisconnect} variant="outline" className="w-full">
                  <XCircle className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleConnect} className="w-full">
                  <WalletIcon className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-xs">No wallets connected yet</p>
                  <p className="text-xs mt-1">Connect your wallet to unlock all features</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Wallet;
