import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Wallet, Shield } from "lucide-react";

export const SolanaSetupAlert = () => {
  return (
    <Alert className="mb-6 border-destructive/20 bg-destructive/5">
      <Shield className="h-4 w-4 text-destructive" />
      <AlertTitle className="text-sm font-semibold text-destructive">⚠️ Solana Mainnet Active - Real Transactions</AlertTitle>
      <AlertDescription className="text-xs space-y-2 mt-2">
        <p className="font-semibold text-destructive">
          This app uses <strong>Solana Mainnet</strong> for REAL transactions with actual value.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li><strong>Real money:</strong> All transactions use actual SOL with real-world value</li>
          <li><strong>Permanent:</strong> All transactions are permanent and irreversible on the blockchain</li>
          <li><strong>Transaction fees:</strong> Gas fees are paid in real SOL for every operation</li>
          <li><strong>Your wallet:</strong> You maintain full control and custody of your funds</li>
          <li><strong>Safety first:</strong> Start with small amounts to test functionality</li>
        </ul>
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-destructive/20">
          <Wallet className="h-3 w-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">
            Connect your mainnet wallet (Phantom, Solflare, OKX) to begin
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://explorer.solana.com", "_blank")}
            className="text-xs h-7"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Mainnet Explorer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://status.solana.com", "_blank")}
            className="text-xs h-7"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Network Status
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
