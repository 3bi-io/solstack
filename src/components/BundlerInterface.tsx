import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTelegram } from "@/hooks/useTelegram";

interface BundlerInterfaceProps {
  onCtaClick: () => void;
}

export const BundlerInterface = ({ onCtaClick }: BundlerInterfaceProps) => {
  const { hapticFeedback, isInTelegram } = useTelegram();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleBundle = () => {
    onCtaClick();
    
    if (!amount || !recipient) {
      if (isInTelegram) {
        hapticFeedback.notification("error");
      }
      toast.error("Please fill in all fields");
      return;
    }
    
    if (isInTelegram) {
      hapticFeedback.notification("success");
    }
    
    toast.success("Bundle created successfully!");
    setAmount("");
    setRecipient("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Create Bundle</CardTitle>
            <CardDescription>Bundle your transactions for optimal efficiency</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Amount</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Recipient Address</label>
          <Input
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary font-mono text-sm"
          />
        </div>

        <Button 
          variant="gradient" 
          size="lg" 
          className="w-full"
          onClick={handleBundle}
        >
          <Send className="w-4 h-4" />
          Create Bundle
        </Button>
      </CardContent>
    </Card>
  );
};
