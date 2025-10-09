import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Key, 
  Users, 
  GitMerge, 
  Gift, 
  Shield, 
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdvancedFeaturesGrid = () => {
  const navigate = useNavigate();

  const advancedFeatures = [
    {
      icon: Key,
      title: "API Access",
      description: "Enterprise-grade REST API with authentication and rate limiting",
      features: ["1,000 req/hour", "SHA-256 security", "Usage analytics"],
      route: "/api-keys",
      badge: "Enterprise",
      gradient: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      icon: Users,
      title: "Referral Program",
      description: "Earn rewards by inviting users to the platform",
      features: ["10% commission", "Unique codes", "Track earnings"],
      route: "/referrals",
      badge: "Earn",
      gradient: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20",
    },
    {
      icon: GitMerge,
      title: "Multi-Signature",
      description: "Secure multi-sig wallets with threshold signatures",
      features: ["Threshold sigs", "Proposal system", "Signer mgmt"],
      route: "/multisig",
      badge: "Security",
      gradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      icon: Gift,
      title: "Merkle Airdrops",
      description: "Gas-efficient airdrop distribution with on-chain verification",
      features: ["Gas efficient", "Merkle proofs", "Claim tracking"],
      route: "/merkle-airdrop",
      badge: "Advanced",
      gradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Shield className="w-3 h-3 mr-1" />
          Advanced Features
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Enterprise-Grade Tools
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional features for teams and developers building on Solana
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {advancedFeatures.map((feature, idx) => (
          <Card 
            key={idx}
            className={`group relative overflow-hidden bg-gradient-to-br ${feature.gradient} ${feature.borderColor} hover:shadow-xl transition-all hover:scale-[1.02]`}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-3">
                {feature.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative space-y-4">
              {/* Feature List */}
              <div className="flex flex-wrap gap-2">
                {feature.features.map((item, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {item}
                  </Badge>
                ))}
              </div>

              {/* CTA */}
              <Button
                variant="ghost"
                className="w-full justify-between group/btn"
                onClick={() => navigate(feature.route)}
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};