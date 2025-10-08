import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Wallet } from "lucide-react";

export const SolanaSetupAlert = () => {
  return (
    <Alert className="mb-6 border-primary/20 bg-primary/5">
      <Wallet className="h-4 w-4 text-primary" />
      <AlertTitle className="text-sm font-semibold">Solana Devnet Active</AlertTitle>
      <AlertDescription className="text-xs space-y-2 mt-2">
        <p>
          This app uses <strong>Solana Devnet</strong> for testing. You need devnet SOL for transactions.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://faucet.solana.com/', '_blank')}
            className="text-xs h-7"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Get Devnet SOL
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://explorer.solana.com/?cluster=devnet', '_blank')}
            className="text-xs h-7"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Solana Explorer
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
