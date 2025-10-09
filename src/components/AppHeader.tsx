import { Home, Menu, Rocket, Gift, ChartCandlestick, Users, Key, GitMerge, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { NetworkStatus } from "@/components/NetworkStatus";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import logoImage from "@/assets/solstack-logo.png";

export const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-3 sm:px-6">
        {/* Left: Logo & Home Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <img 
                src={logoImage} 
                alt="SOL Stack" 
                className="h-9 w-9 rounded-lg shadow-md group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all">
                SOL Stack
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1">
                Solana DeFi Platform
              </span>
            </div>
          </button>
          
          {!isHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 hidden md:flex hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          )}
        </div>

        {/* Center: Network Status (hidden on mobile) */}
        <div className="hidden md:flex flex-1 justify-center">
          <NetworkStatus />
        </div>

        {/* Right: User Menu & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Mobile Network Status Badge */}
          <div className="md:hidden">
            <NetworkStatus compact />
          </div>
          
          <UserMenu />
          
          {/* Mobile Navigation Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:bg-primary/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background/95 backdrop-blur-xl border-primary/20">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={logoImage} alt="SOL Stack" className="h-8 w-8 rounded-lg" />
                  <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Navigation
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-primary/10"
                  onClick={() => {
                    navigate("/");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>

                <div className="py-2">
                  <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">Core Features</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10"
                    onClick={() => {
                      navigate("/launch");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Rocket className="h-4 w-4" />
                    Launch Token
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10"
                    onClick={() => {
                      navigate("/airdrop");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Gift className="h-4 w-4" />
                    Airdrops
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10"
                    onClick={() => {
                      navigate("/markets");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ChartCandlestick className="h-4 w-4" />
                    <span className="flex items-center gap-2">
                      Markets
                      <Badge variant="secondary" className="text-[10px] h-4">
                        <Sparkles className="h-2 w-2 mr-0.5" />
                        AI
                      </Badge>
                    </span>
                  </Button>
                </div>

                <div className="py-2">
                  <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">Advanced</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10"
                    onClick={() => {
                      navigate("/referrals");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Users className="h-4 w-4" />
                    Referrals
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10"
                    onClick={() => {
                      navigate("/api-keys");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Key className="h-4 w-4" />
                    API Access
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10"
                    onClick={() => {
                      navigate("/multisig");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <GitMerge className="h-4 w-4" />
                    Multi-Sig
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
