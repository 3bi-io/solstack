import { Badge } from "@/components/ui/badge";

export const SecurityBadge = () => {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Badge variant="secondary" className="text-xs px-3 py-1.5 shadow-lg backdrop-blur-sm bg-secondary/80">
        ✅ Secure Website (Encryption Enabled)
      </Badge>
    </div>
  );
};
