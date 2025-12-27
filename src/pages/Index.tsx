import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { MarketPreview } from "@/components/MarketPreview";
import { CoreToolsSection } from "@/components/CoreToolsSection";
import { WhySolstackSection } from "@/components/WhySolstackSection";
import { LandingFooter } from "@/components/LandingFooter";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { 
  Wallet,
  ArrowRight,
  Zap,
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://solstack.me/",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24 overflow-hidden">
      <SEO
        title="SOLSTACK - AI-Driven DeFi on Solana | Bridged to Genesis One"
        description="No rugs. No hype. Just verifiable yields and tools. Trade, farm, bridge with AI scam guards and on-chain transparency. The first honest DeFi platform on Solana."
        keywords="Solana DeFi, Genesis One bridge, AI scam detection, safe farming, SPL token launch, Solana trading, crypto security, rug-pull protection"
        url="/"
        structuredData={breadcrumbSchema}
      />
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <div className="space-y-12 sm:space-y-16">
          {/* Hero Section - Full viewport */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Hero />
          </div>

          {/* Core Tools Section */}
          <div 
            id="core-tools"
            className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <CoreToolsSection />
          </div>

          {/* Live Markets with AI Risk */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center mb-6">
              <Badge variant="outline" className="border-accent/30 text-accent font-mono mb-3">
                Live Data
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-foreground">
                Live Markets
              </h2>
              <p className="text-muted-foreground font-mono text-sm mt-2">
                Top pairs with AI risk scoring • Real-time from OKX
              </p>
            </div>
            <MarketPreview />
          </div>

          {/* Why SolStack Section */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <WhySolstackSection />
          </div>

          {/* Get Started Section */}
          <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="relative overflow-hidden p-8 sm:p-10 md:p-12 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20 text-center">
              {/* Glow effects */}
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/15 rounded-full blur-[80px]" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <Badge className="bg-primary/20 text-primary-foreground border-0 font-mono">
                  <Zap className="w-3 h-3 mr-1" />
                  Get Started
                </Badge>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-foreground">
                  Connect Wallet → Dashboard
                </h2>
                
                <p className="text-muted-foreground font-sans text-lg">
                  Access Swaps (Jupiter integration), Farms, Bridge, and AI Chat.
                </p>
                
                <div className="inline-block px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-sm font-mono text-accent">
                    No tiers. No fees beyond Solana gas.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/wallet')}
                    className="font-mono text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/30"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/help')}
                    className="font-mono text-lg px-8 py-6 border-accent/50 text-accent hover:bg-accent/10"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <LandingFooter />
        </div>
      </div>
      
      <TelegramNavigation />
    </div>
  );
};

export default Index;
