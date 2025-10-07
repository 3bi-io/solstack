import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

const Airdrop = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Airdrop Management</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage and distribute airdrops
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No active airdrops</p>
              <p className="text-xs mt-1">Create your first airdrop campaign</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Airdrop;
