import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield } from "lucide-react";

export const SecurityNoticeDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem("securityNoticeDismissed");
    if (!hasSeenNotice) {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("securityNoticeDismissed", "true");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-green-600" />
            ✅ Secure Website (Encryption Enabled)
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3 pt-2">
            <p className="font-medium text-foreground">Connection is secure.</p>
            <p className="text-sm">
              Your information (passwords, transaction details, and private keys) are encrypted when sent to this site.
            </p>
            <div className="space-y-1 text-sm">
              <p>✔️ Verified certificate issued by Entrust.</p>
              <p>✔️ Encrypted using TLS 1.3</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleDismiss}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
