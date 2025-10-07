import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const feedbackSchema = z.object({
  feedback: z.string().trim().min(1, { message: "Feedback cannot be empty" }).max(1000, { message: "Feedback must be less than 1000 characters" }),
});

export const FeedbackDialog = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = feedbackSchema.safeParse({ feedback });
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError("");
    
    // Here you would send the feedback to your backend
    console.log("Feedback submitted:", feedback);
    
    toast({
      title: "Thank you!",
      description: "Your feedback has been submitted.",
    });
    
    setOpen(false);
    setFeedback("");
  };

  const handleSkip = () => {
    setOpen(false);
    setFeedback("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts and suggestions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError("");
              }}
              className="min-h-[120px]"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
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
