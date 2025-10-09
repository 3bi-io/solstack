import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Gift, 
  BarChart3, 
  Wallet,
  Coins,
  Send,
  Shield,
  Zap,
  Globe,
  CheckCircle
} from "lucide-react";

export const FeaturesShowcase = () => {
  const coreFeatures = [
    {
      icon: Rocket,
      title: "Token Launch",
      description: "Create SPL tokens with custom metadata and extensions",
      stats: "In minutes",
      color: "text-blue-500",
    },
    {
      icon: Gift,
      title: "Airdrops",
      description: "Distribute tokens to multiple addresses efficiently",
      stats: "Bulk & Scheduled",
      color: "text-green-500",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Real-time tracking with detailed transaction logs",
      stats: "Live Updates",
      color: "text-purple-500",
    },
    {
      icon: Wallet,
      title: "Wallet Management",
      description: "Secure wallet integration with multiple providers",
      stats: "Multi-Provider",
      color: "text-orange-500",
    },
    {
      icon: Coins,
      title: "Token Bundler",
      description: "Optimize gas fees with transaction bundling",
      stats: "Save Gas",
      color: "text-yellow-500",
    },
    {
      icon: Send,
      title: "Swaps",
      description: "Seamless token swaps via Jupiter aggregator",
      stats: "Best Rates",
      color: "text-cyan-500",
    },
  ];

  const platformHighlights = [
    { icon: Shield, text: "Bank-grade security with RLS" },
    { icon: Zap, text: "Lightning-fast Solana network" },
    { icon: Globe, text: "Multi-chain market data" },
    { icon: CheckCircle, text: "Production-ready infrastructure" },
  ];

  return (
    <div className="space-y-8">
      {/* Platform Highlights */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        {platformHighlights.map((highlight, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <highlight.icon className="w-4 h-4 text-primary" />
            <span>{highlight.text}</span>
          </div>
        ))}
      </div>

      {/* Core Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coreFeatures.map((feature, idx) => (
          <Card
            key={idx}
            className="group relative overflow-hidden p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative space-y-3">
              {/* Icon & Badge */}
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-primary/10 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.stats}
                </Badge>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};