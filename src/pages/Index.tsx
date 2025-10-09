import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { AppHeader } from "@/components/AppHeader";
import { QuickActions } from "@/components/QuickActions";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { MarketPreview } from "@/components/MarketPreview";
import { FeaturesShowcase } from "@/components/FeaturesShowcase";
import { AICapabilitiesCard } from "@/components/AICapabilitiesCard";
import { AdvancedFeaturesGrid } from "@/components/AdvancedFeaturesGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { 
  Sparkles,
  Rocket,
  Gift,
  TrendingUp,
  CheckCircle,
  Users,
  Globe,
  ChartCandlestick,
  ArrowRight
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
    setIsVisible(true);
  }, [isInTelegram, hapticFeedback]);

  const trustSignals = [
    { icon: CheckCircle, text: "Blockchain Verified" },
    { icon: Users, text: "Trusted Platform" },
    { icon: Globe, text: "Global Network" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24 overflow-hidden">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <div className="space-y-8 sm:space-y-12">
          {/* Hero Section */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Hero />
          </div>

          {/* CTA Section for Non-Connected Users */}
          {!connected && (
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card className="relative overflow-hidden p-6 sm:p-8 md:p-10 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20 text-center group hover:border-primary/40 transition-all">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-5">
                  <Badge className="mb-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground border-0">
                    <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                    AI-Powered Solana Platform
                  </Badge>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    Build, Analyze & Trade with AI
                  </h2>
                  
                  <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    Launch tokens, manage airdrops, and leverage AI-powered market analysis with Claude, GPT-4, Perplexity, and Grok
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
                    <WalletMultiButton className="gap-2 shadow-lg hover:shadow-primary/20 min-h-[44px]" />
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate("/help")}
                      className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 min-h-[44px]"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <QuickActions />
          </div>

          <Separator className="my-8" />

          {/* AI Capabilities Highlight */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <AICapabilitiesCard />
          </div>

          <Separator className="my-8" />

          {/* Core Features */}
          <div className={`transition-all duration-700 delay-250 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center space-y-3 mb-8">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Platform Capabilities
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Everything You Need
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive toolkit for building, trading, and analyzing on Solana
              </p>
            </div>
            <FeaturesShowcase />
          </div>

          <Separator className="my-8" />

          {/* Advanced Features */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <AdvancedFeaturesGrid />
          </div>

          <Separator className="my-8" />

          {/* Market Intelligence */}
          <div className={`transition-all duration-700 delay-350 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-background border-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="relative z-10 p-6 sm:p-8 text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <ChartCandlestick className="w-8 h-8 text-blue-500" />
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Multi-Source Market Data
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Real-Time Market Intelligence
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Track markets from CoinGecko, OKX, and MoonShot. Live updates every 10 seconds with advanced filtering and favorites
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
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
                    <span>AI Analysis</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate("/markets")}
                  className="gap-2 mt-4"
                >
                  Explore Markets
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Market Preview */}
          <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <MarketPreview />
          </div>

          {/* Bottom CTA for Connected Users */}
          {connected && (
            <div className={`transition-all duration-700 delay-450 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20 text-center group hover:border-primary/40 transition-all">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 space-y-4">
                  <Rocket className="w-12 h-12 mx-auto text-primary animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-bold">Ready to Build?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Launch tokens, distribute airdrops, or explore AI-powered market analysis
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button 
                      size="lg"
                      onClick={() => navigate("/launch")}
                      className="gap-2 shadow-lg hover:shadow-primary/20 min-h-[44px]"
                    >
                      <Rocket className="w-4 h-4" />
                      Launch Token
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      onClick={() => navigate("/airdrop")}
                      className="gap-2 border-primary/20 hover:border-primary/40 min-h-[44px]"
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