import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export const PhoneMockup = ({ children, className = "" }: PhoneMockupProps) => {
  return (
    <div className="relative max-w-sm mx-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-3xl opacity-30 rounded-full scale-75" />
      <div className={`relative bg-card/90 backdrop-blur-xl rounded-[3rem] p-3 border-4 border-primary/30 shadow-2xl ${className}`}>
        <div className="bg-gradient-to-b from-background via-background to-primary/5 rounded-[2.5rem] overflow-hidden aspect-[9/19]">
          {children}
        </div>
      </div>
    </div>
  );
};
