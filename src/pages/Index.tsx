import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { StatsGrid } from "@/components/StatsGrid";
import { FeatureCard } from "@/components/FeatureCard";
import { QuickActions } from "@/components/QuickActions";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { useFeedback } from "@/contexts/FeedbackContext";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Coins, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  Rocket,
  Gift,
  CheckCircle,
  Users,
  Globe
} from "lucide-react";

const Index = () => {
  const { isInTelegram, hapticFeedback } = useTelegram();
  const { isConnected } = useWallet();
  const { openFeedback } = useFeedback();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInTelegram) {
      hapticFeedback.impact("soft");
    }
    // Trigger entrance animations
    setIsVisible(true);
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

  const trustSignals = [
    { icon: CheckCircle, text: "Blockchain Verified" },
    { icon: Users, text: "Trusted by Developers" },
    { icon: Globe, text: "Global Network" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Hero Section with Animation */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Hero />
        </div>
        
        <div className="space-y-8 mt-8">
          {/* Enhanced CTA Section for Non-Connected Users */}
          {!isConnected && (
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20 text-center group hover:border-primary/40 transition-all">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <Badge className="mb-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground border-0">
                    <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                    Lightning Fast Solana API
                  </Badge>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    Start Building on Solana Today
                  </h2>
                  
                  <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                    Create tokens, manage airdrops, and track transactions all in one powerful platform
                  </p>
                  
                  {/* Trust Signals */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2 pb-4">
                    {trustSignals.map((signal, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <signal.icon className="w-4 h-4 text-accent" />
                        <span>{signal.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button 
                      size="lg" 
                      onClick={openFeedback}
                      className="gap-2 group/btn relative overflow-hidden shadow-lg hover:shadow-primary/20"
                    >
                      <span className="relative z-10">Connect Wallet to Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-primary opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate("/help")}
                      className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Quick Actions for Connected Users with Animation */}
          {isConnected && (
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <QuickActions />
            </div>
          )}

          {/* Welcome Message with Animation */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <WelcomeMessage />
          </div>

          {/* Enhanced Features Grid */}
          <div className={`space-y-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center space-y-2">
              <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
                Platform Features
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Why Choose ProTools Bundler?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built for speed, security, and scale on the Solana blockchain
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`transition-all duration-500 hover-scale ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stats with Animation */}
          <div className={`transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <StatsGrid />
          </div>

          {/* Enhanced Bottom CTA for Connected Users */}
          {isConnected && (
            <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20 text-center group hover:border-primary/40 transition-all">
                {/* Animated glow effect */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 space-y-4">
                  <Rocket className="w-12 h-12 mx-auto text-primary animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-bold">Ready to launch your next project?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start with token creation or distribute rewards through airdrops
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button 
                      size="lg"
                      onClick={() => navigate("/launch")}
                      className="gap-2 shadow-lg hover:shadow-primary/20"
                    >
                      <Rocket className="w-4 h-4" />
                      Launch Token
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      onClick={() => navigate("/airdrop")}
                      className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Gift className="w-4 h-4" />
                      Create Airdrop
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Index;
