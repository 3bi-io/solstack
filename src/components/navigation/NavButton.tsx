import { LucideIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  badge?: string;
  onClick: () => void;
}

export const NavButton = ({ icon: Icon, label, badge, onClick }: NavButtonProps) => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 hover:bg-primary/10"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span className="flex items-center gap-2">
        {label}
        {badge && (
          <Badge variant="secondary" className="text-[10px] h-4">
            <Sparkles className="h-2 w-2 mr-0.5" />
            {badge}
          </Badge>
        )}
      </span>
    </Button>
  );
};
