import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureMockupProps {
  title: string;
  description: string;
  icon: LucideIcon;
  mockupContent: React.ReactNode;
  reversed?: boolean;
}

export const FeatureMockup = ({ 
  title, 
  description, 
  icon: Icon, 
  mockupContent, 
  reversed = false 
}: FeatureMockupProps) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      <div className={`${reversed ? 'lg:order-2' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black">{title}</h3>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      
      <div className={`${reversed ? 'lg:order-1' : ''}`}>
        {mockupContent}
      </div>
    </div>
  );
};
