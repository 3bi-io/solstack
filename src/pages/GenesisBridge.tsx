import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeftRight, 
  Lock, 
  Shield, 
  Clock, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Wallet,
  RefreshCw,
  ArrowRight,
  Zap,
  Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BridgeSwapInterface } from "@/components/bridge/BridgeSwapInterface";
import { VaultStatus } from "@/components/bridge/VaultStatus";
import { BridgeTransactionHistory } from "@/components/bridge/BridgeTransactionHistory";
import { BridgeStats } from "@/components/bridge/BridgeStats";

const GenesisBridge = () => {
  const bridgeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Genesis Bridge - SOL ↔ GEN1 Secure Cross-Chain Swap",
    description: "Bridge SOL to GEN1 securely with audited vaults and locked liquidity. No admin withdraw capabilities.",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEO
        title="Genesis Bridge - SOL ↔ GEN1 Secure Cross-Chain Swap"
        description="Bridge SOL to GEN1 securely with audited vaults and locked liquidity. No admin withdraw capabilities. Built on Solana, anchored on Genesis One."
        keywords="Genesis Bridge, SOL to GEN1, cross-chain swap, Solana bridge, Genesis One, secure bridge, crypto bridge"
        url="/bridge"
        structuredData={bridgeStructuredData}
      />
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/10 border-accent/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/20 rounded-xl">
                  <ArrowLeftRight className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-accent via-foreground to-primary bg-clip-text text-transparent font-mono">
                    Genesis Bridge
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Secure swap between Solana and Genesis One
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500">
                  <CheckCircle className="w-3 h-3" />
                  Audited
                </Badge>
                <Badge variant="outline" className="gap-1 border-accent/50 text-accent">
                  <Lock className="w-3 h-3" />
                  Locked Liquidity
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="w-3 h-3" />
                  No Admin Withdraw
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground max-w-2xl">
              Bridge your assets securely between Solana and Genesis One. Our audited vault system ensures your funds are protected with locked liquidity and no admin withdrawal capabilities.
            </p>
          </CardContent>
        </Card>

        {/* Bridge Stats */}
        <BridgeStats />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Swap Interface - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <BridgeSwapInterface />
          </div>

          {/* Vault Status - Right sidebar */}
          <div className="space-y-6">
            <VaultStatus />
          </div>
        </div>

        {/* Transaction History */}
        <BridgeTransactionHistory />

        {/* Security Info */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Bridge Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <h4 className="font-semibold">Locked Liquidity</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  All bridge liquidity is locked in audited smart contracts with no admin withdrawal capabilities.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <h4 className="font-semibold">Audited Vault</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  The vault contract has been audited by leading security firms and is fully open source.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Fast Finality</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transactions are confirmed within seconds thanks to Solana's fast block times.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TelegramNavigation />
    </div>
  );
};

export default GenesisBridge;
