import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { AppHeader } from "@/components/AppHeader";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { FeatureCard } from "@/components/FeatureCard";
import { QuickActions } from "@/components/QuickActions";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { MarketPreview } from "@/components/MarketPreview";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
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
  Globe,
  ChartCandlestick,
  BarChart3
} from "lucide-react";

const Index = () => {
  const { isInTelegram, hapticFeedback } = useTelegram();
  const { connected } = useWallet();
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
    <div className="min-h-screen bg-background pb-20 sm:pb-24 overflow-hidden">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Hero Section with Animation */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Hero />
        </div>
        
        <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
          {/* Enhanced CTA Section for Non-Connected Users */}
          {!connected && (
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card className="relative overflow-hidden p-5 sm:p-6 md:p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20 text-center group hover:border-primary/40 transition-all">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 max-w-2xl mx-auto space-y-3 sm:space-y-4">
                  <Badge className="mb-1 sm:mb-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground border-0 text-xs sm:text-sm">
                    <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                    Lightning Fast Solana API
                  </Badge>
                  
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent px-2">
                    Start Building on Solana Today
                  </h2>
                  
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed px-2">
                    Create tokens, manage airdrops, and track transactions all in one powerful platform
                  </p>
                  
                  {/* Trust Signals */}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 pb-3 sm:pb-4 px-2">
                    {trustSignals.map((signal, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <signal.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                        <span className="whitespace-nowrap">{signal.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 px-2">
                    <WalletMultiButton className="gap-2 group/btn relative overflow-hidden shadow-lg hover:shadow-primary/20 w-full sm:w-auto min-h-[44px] touch-manipulation" />
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate("/help")}
                      className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto min-h-[44px] touch-manipulation"
                    >
                      <span className="text-sm sm:text-base">Learn More</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Quick Actions for Connected Users with Animation */}
          {connected && (
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <QuickActions />
            </div>
          )}

          {/* Welcome Message with Animation */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <WelcomeMessage />
          </div>

          {/* Enhanced Features Grid */}
          <div className={`space-y-4 sm:space-y-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center space-y-2 px-2">
              <Badge variant="outline" className="mb-1 sm:mb-2 border-primary/30 text-primary text-xs sm:text-sm">
                Platform Features
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent px-2">
                Why Choose SOL Stack?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
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

          {/* Markets Feature Highlight Section */}
          <div className={`space-y-4 transition-all duration-700 delay-450 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              <div className="relative z-10 p-6 sm:p-8 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <ChartCandlestick className="w-8 h-8 text-primary" />
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <Badge className="mb-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Real-Time Market Intelligence
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  Track Every Market Move
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                  Access live data from CoinGecko, OKX, and MoonShot. Search, filter, and favorite tokens. Export data and set price alerts.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>3 Data Sources</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Live Updates</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Advanced Filtering</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Market Preview Widget */}
          <div className={`transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <MarketPreview />
          </div>

          {/* Enhanced Bottom CTA for Connected Users */}
          {connected && (
            <div className={`transition-all duration-700 delay-550 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20 text-center group hover:border-primary/40 transition-all">
                {/* Animated glow effect */}
                <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 space-y-3 sm:space-y-4">
                  <Rocket className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-primary animate-pulse" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold px-2">Ready to launch your next project?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-2">
                    Start with token creation or distribute rewards through airdrops
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 px-2">
                    <Button 
                      size="lg"
                      onClick={() => navigate("/launch")}
                      className="gap-2 shadow-lg hover:shadow-primary/20 w-full sm:w-auto min-h-[44px] touch-manipulation"
                    >
                      <Rocket className="w-4 h-4" />
                      Launch Token
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      onClick={() => navigate("/airdrop")}
                      className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto min-h-[44px] touch-manipulation"
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
