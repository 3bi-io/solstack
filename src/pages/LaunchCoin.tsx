import { useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";

const LaunchCoin = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const { hapticFeedback } = useTelegram();
  const { toast } = useToast();

  const handleLaunch = () => {
    hapticFeedback.impact("medium");
    toast({
      title: "Coming Soon",
      description: "Token launch feature will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Launch Coin</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Create and deploy your token
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName" className="text-xs sm:text-sm">Token Name</Label>
              <Input
                id="tokenName"
                placeholder="e.g., My Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenSymbol" className="text-xs sm:text-sm">Token Symbol</Label>
              <Input
                id="tokenSymbol"
                placeholder="e.g., MTK"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>
            <Button onClick={handleLaunch} className="w-full">
              <Rocket className="w-4 h-4 mr-2" />
              Launch Token
            </Button>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default LaunchCoin;
