import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:scale-105">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
};
