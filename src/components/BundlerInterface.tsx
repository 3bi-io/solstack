import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Send, Plus, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTelegram } from "@/hooks/useTelegram";
import { useBundleManager, BundleWallet } from "@/hooks/useBundleManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BundlerInterfaceProps {
  onCtaClick: () => void;
}

export const BundlerInterface = ({ onCtaClick }: BundlerInterfaceProps) => {
  const { hapticFeedback, isInTelegram } = useTelegram();
  const { createBundle, executeBundle, isCreating, isExecuting } = useBundleManager();
  
  const [bundleName, setBundleName] = useState("");
  const [distributionStrategy, setDistributionStrategy] = useState<'equal' | 'weighted' | 'custom'>('equal');
  const [token, setToken] = useState('SOL');
  const [wallets, setWallets] = useState<BundleWallet[]>([
    { address: '', amount: 0, name: 'Wallet 1' }
  ]);
  const [recipient, setRecipient] = useState("");

  const addWallet = () => {
    setWallets([...wallets, { address: '', amount: 0, name: `Wallet ${wallets.length + 1}` }]);
  };

  const removeWallet = (index: number) => {
    if (wallets.length > 1) {
      setWallets(wallets.filter((_, i) => i !== index));
    }
  };

  const updateWallet = (index: number, field: keyof BundleWallet, value: string | number) => {
    const updated = [...wallets];
    updated[index] = { ...updated[index], [field]: value };
    setWallets(updated);
  };

  const handleCreateAndExecute = async () => {
    onCtaClick();
    
    if (!bundleName || wallets.some(w => !w.address || w.amount <= 0)) {
      if (isInTelegram) {
        hapticFeedback.notification("error");
      }
      toast.error("Please fill in all wallet addresses and amounts");
      return;
    }

    try {
      if (isInTelegram) {
        hapticFeedback.notification("success");
      }

      // Create bundle
      const bundle = await createBundle({
        bundleName,
        wallets,
        distributionStrategy,
        recipient,
        token,
      });

      // Execute bundle
      await executeBundle(bundle.id, wallets, { distributionStrategy, recipient, token });

      // Reset form
      setBundleName("");
      setWallets([{ address: '', amount: 0, name: 'Wallet 1' }]);
      setRecipient("");
      
    } catch (error) {
      if (isInTelegram) {
        hapticFeedback.notification("error");
      }
    }
  };

  const totalAmount = wallets.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg">Multi-Wallet Bundle</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Execute atomic transactions across multiple wallets</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Bundle Name */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Bundle Name</Label>
          <Input
            placeholder="My Bundle"
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary text-sm"
          />
        </div>

        {/* Distribution Strategy */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Distribution Strategy</Label>
          <Select value={distributionStrategy} onValueChange={(v: any) => setDistributionStrategy(v)}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">Equal Distribution</SelectItem>
              <SelectItem value="weighted">Weighted Distribution</SelectItem>
              <SelectItem value="custom">Custom Amounts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Token Selection */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Token</Label>
          <Select value={token} onValueChange={setToken}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SOL">SOL</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Wallets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm">Wallets ({wallets.length})</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addWallet}
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Wallet
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {wallets.map((wallet, index) => (
              <div key={index} className="flex gap-2 items-start p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Wallet address"
                    value={wallet.address}
                    onChange={(e) => updateWallet(index, 'address', e.target.value)}
                    className="font-mono text-xs bg-background/50"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Name (optional)"
                      value={wallet.name || ''}
                      onChange={(e) => updateWallet(index, 'name', e.target.value)}
                      className="text-xs bg-background/50"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={wallet.amount || ''}
                      onChange={(e) => updateWallet(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="text-xs bg-background/50 w-24"
                    />
                  </div>
                </div>
                {wallets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWallet(index)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recipient (Optional) */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Recipient Address (Optional)</Label>
          <Input
            placeholder="Leave empty to send to same wallet"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary font-mono text-xs sm:text-sm"
          />
        </div>

        {/* Summary */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-semibold">{totalAmount.toFixed(4)} {token}</span>
          </div>
        </div>

        {/* Execute Button */}
        <Button 
          variant="gradient" 
          size="lg" 
          className="w-full text-sm sm:text-base"
          onClick={handleCreateAndExecute}
          disabled={isCreating || isExecuting}
        >
          {isCreating || isExecuting ? (
            <>Processing...</>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Create & Execute Bundle
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
