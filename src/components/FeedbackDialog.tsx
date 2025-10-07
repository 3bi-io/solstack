import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const feedbackSchema = z.object({
  fields: z.array(z.string().trim().max(200, { message: "Field must be less than 200 characters" })),
});

export const FeedbackDialog = () => {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = feedbackSchema.safeParse({ fields });
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError("");
    
    // Here you would send the feedback to your backend
    console.log("Feedback submitted:", fields);
    
    toast({
      title: "Thank you!",
      description: "Your feedback has been submitted.",
    });
    
    setOpen(false);
    setFields(Array(12).fill(""));
  };

  const handleSkip = () => {
    setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>ProTools Bundler Bot Feedback</DialogTitle>
          <DialogDescription>
            The ProTools Bundler Bot helps you efficiently bundle and manage your cryptocurrency transactions. 
            Share your experience and suggestions to help us improve the bot's functionality and performance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {fields.map((field, index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`field-${index}`}>{index + 1}.</Label>
                <Input
                  id={`field-${index}`}
                  placeholder={`Text ${index + 1}`}
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
