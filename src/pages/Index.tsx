import { useEffect } from "react";
import { Hero } from "@/components/Hero";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { StatsGrid } from "@/components/StatsGrid";
import { FeatureCard } from "@/components/FeatureCard";
import { QuickActions } from "@/components/QuickActions";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { 
  Zap, 
  Shield, 
  Coins, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  Rocket,
  Gift
} from "lucide-react";

const Index = () => {
  const { isInTelegram, hapticFeedback } = useTelegram();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInTelegram) {
      hapticFeedback.impact("soft");
    }
  }, [isInTelegram, hapticFeedback]);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized transaction bundling for minimal fees and maximum speed",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-grade encryption with RLS policies protecting your data",
    },
    {
      icon: Coins,
      title: "SPL Token Creation",
      description: "Launch your own Solana tokens in minutes with full control",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track all transactions and activities with detailed logs",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Hero Section */}
        <Hero />
        
        <div className="space-y-8 mt-8">
          {/* CTA Section */}
          {!user && (
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20 text-center">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-xs font-medium mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Now with Real Solana Integration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Start Building on Solana Today
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Create tokens, manage airdrops, and track transactions all in one powerful platform
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate("/help")}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Actions for Authenticated Users */}
          {user && <QuickActions />}

          {/* Welcome Message */}
          <WelcomeMessage />

          {/* Features Grid */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-center">
              Why Choose ProTools Bundler?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <StatsGrid />

          {/* Bottom CTA for Authenticated Users */}
          {user && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/10 text-center">
              <h3 className="text-lg font-semibold mb-2">Ready to launch your next project?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start with token creation or distribute rewards through airdrops
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/launch")}>
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Token
                </Button>
                <Button variant="outline" onClick={() => navigate("/airdrop")}>
                  <Gift className="w-4 h-4 mr-2" />
                  Create Airdrop
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Index;
