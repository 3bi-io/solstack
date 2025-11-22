import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Wallet = () => {
  const { connected, publicKey } = useWallet();

  const walletStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Solana Wallet Connection",
    description: "Connect your Solana wallet to access DeFi features. Support for Phantom, Solflare, and all major Solana wallets.",
    applicationCategory: "FinanceApplication",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="Connect Solana Wallet - Phantom, Solflare & More | SOL Stack"
        description="Securely connect your Solana wallet to access DeFi features. Support for Phantom, Solflare, and all major Solana wallet extensions. Safe and encrypted connection."
        keywords="Solana wallet, connect wallet, Phantom wallet, Solflare, wallet adapter, Solana wallet connection, crypto wallet"
        url="/wallet"
        structuredData={walletStructuredData}
      />
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
                  {connected && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {connected ? "Your wallet is connected and all features are enabled" : "Connect your Solana wallet"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {connected && publicKey ? (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">Wallet Connected</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Your wallet is successfully connected. You now have full access to all features including:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Launch new coins</li>
                        <li>View transaction history</li>
                        <li>Manage airdrops</li>
                        <li>Access logs and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Connected Address</p>
                  <p className="font-mono text-xs break-all">{publicKey.toBase58()}</p>
                </div>
                
                <div className="flex justify-center pt-2">
                  <WalletConnectButton />
                </div>
              </>
            ) : (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Click the button below to connect your Solana wallet. We support Phantom, Solflare, and other popular wallet extensions.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col items-center gap-4 py-6">
                  <WalletConnectButton />
                  <div className="text-center text-muted-foreground">
                    <p className="text-xs">No wallet connected yet</p>
                    <p className="text-xs mt-1">Connect your wallet to unlock all features</p>
                  </div>
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
