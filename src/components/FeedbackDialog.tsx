import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import logo from "@/assets/logo.jpeg";

const feedbackSchema = z.object({
  fields: z.array(z.string().trim().max(200, { message: "Field must be less than 200 characters" })),
});

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  telegramUser?: TelegramUser | null;
}

export const FeedbackDialog = ({ open, onClose, telegramUser }: FeedbackDialogProps) => {
  const [fields, setFields] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = feedbackSchema.safeParse({ fields });
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError("");
    
    // Here you would send the feedback to your backend
    const feedbackData = {
      fields,
      telegramUser: telegramUser ? {
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
      } : null,
      timestamp: new Date().toISOString(),
    };
    console.log("Feedback submitted:", feedbackData);
    
    toast({
      title: "Thank you!",
      description: "Your feedback has been submitted.",
    });
    
    onClose();
    setFields(Array(12).fill(""));
  };

  const handleSkip = () => {
    onClose();
    setFields(Array(12).fill(""));
    setError("");
  };

  const handleFieldChange = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="ProTools Bundler Bot" className="w-12 h-12 rounded-lg" />
            <DialogTitle>Share Your Feedback</DialogTitle>
          </div>
          <DialogDescription>
            Help us improve by sharing your thoughts and suggestions.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <p className="text-sm leading-relaxed">
            Welcome to <span className="font-semibold">ProTools Bundler Bot</span>! This intelligent assistant streamlines your workflow by bundling multiple tools and resources into organized packages. Whether you're managing projects, collaborating with teams, or organizing your digital workspace, our bot adapts to your needs and learns from your preferences to deliver smarter, faster results every time.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {fields.map((field, index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`field-${index}`}>{index + 1}.</Label>
                <Input
                  id={`field-${index}`}
                  value={field}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button type="submit">Submit Feedback</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
