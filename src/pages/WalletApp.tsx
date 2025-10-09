import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeatureMockup } from "@/components/wallet-preview/FeatureMockup";
import { DashboardMockup, SwapMockup, StakingMockup, NFTMockup } from "@/components/wallet-preview/mockups";
import { 
  Shield, 
  Zap, 
  Smartphone, 
  Lock, 
  Fingerprint, 
  Globe, 
  ArrowRight,
  Download,
  Star,
  Users,
  TrendingUp,
  Wallet,
  Coins,
  RefreshCw,
  Bell,
  Layers,
  Scan,
  ChartBar,
  Sparkles,
  Network,
  Key,
  Gift
} from "lucide-react";
import solstackLogo from "@/assets/solstack-logo.png";

const WalletApp = () => {
  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "Bank-level encryption with multi-signature support and hardware wallet integration."
    },
    {
      icon: Zap,
      title: "Lightning Fast Transactions",
      description: "Sub-second transactions on Solana with the lowest fees in the industry."
    },
    {
      icon: Wallet,
      title: "Built-in DEX Aggregator",
      description: "Access the best prices across multiple DEXs with intelligent routing."
    },
    {
      icon: Coins,
      title: "Staking & Yield Farming",
      description: "Earn passive income with one-tap staking and DeFi yield opportunities."
    },
    {
      icon: Layers,
      title: "NFT Gallery & Marketplace",
      description: "Showcase your NFTs, discover new collections, and trade seamlessly."
    },
    {
      icon: RefreshCw,
      title: "Cross-Chain Swaps",
      description: "Bridge assets between Solana, Ethereum, BSC, and 20+ blockchains."
    },
    {
      icon: ChartBar,
      title: "Advanced Portfolio Tracking",
      description: "Real-time portfolio analytics, profit/loss tracking, and tax reporting."
    },
    {
      icon: Bell,
      title: "Smart Price Alerts",
      description: "Never miss opportunities with AI-powered alerts and market insights."
    },
    {
      icon: Scan,
      title: "QR Code Payments",
      description: "Send and receive crypto instantly with QR codes and NFC support."
    },
    {
      icon: Sparkles,
      title: "AI Trading Assistant",
      description: "Get personalized trading recommendations powered by advanced AI."
    },
    {
      icon: Network,
      title: "Web3 DApp Browser",
      description: "Seamlessly connect to thousands of dApps, games, and DeFi protocols."
    },
    {
      icon: Gift,
      title: "Rewards & Cashback",
      description: "Earn rewards on every transaction and get exclusive perks."
    }
  ];

  const stats = [
    { icon: Users, value: "2M+", label: "Active Users" },
    { icon: Star, value: "4.9", label: "App Store Rating" },
    { icon: Download, value: "10M+", label: "Downloads" }
  ];

  const advancedFeatures = [
    {
      title: "Hardware Wallet Support",
      description: "Connect Ledger and Trezor for maximum security",
      icon: Key
    },
    {
      title: "Multi-Signature Wallets",
      description: "Shared wallets for teams and organizations",
      icon: Users
    },
    {
      title: "WalletConnect Integration",
      description: "Connect to any Web3 app with one tap",
      icon: Network
    },
    {
      title: "Fiat On/Off Ramp",
      description: "Buy crypto with credit cards and bank transfers",
      icon: Coins
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <AppHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-30" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-6 text-sm px-4 py-2 bg-primary/10 text-primary border-primary/30">
              Coming Soon to Mobile
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                SOLStack Wallet
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
              The most powerful all-in-one crypto wallet. Trade, stake, earn, and explore Web3 with 
              military-grade security and lightning-fast performance.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                Download for iOS
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 border-primary/30 hover:bg-primary/10 text-lg px-8 py-6"
              >
                <Download className="w-5 h-5" />
                Download for Android
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* App Preview Mockup */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-30 rounded-full" />
            <div className="relative bg-card/80 backdrop-blur-xl rounded-[3rem] p-3 border-4 border-primary/20 shadow-2xl">
              <div className="bg-gradient-to-b from-background to-primary/5 rounded-[2.5rem] p-8 aspect-[9/19]">
                <div className="flex justify-center mb-8">
                  <img 
                    src={solstackLogo} 
                    alt="SOLStack Wallet" 
                    className="w-24 h-24 rounded-2xl shadow-lg"
                  />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Your Crypto.</h3>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Your Control.
                  </h3>
                  <p className="text-sm text-muted-foreground px-4">
                    Experience the power of Solana in the palm of your hand
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Mockups Showcase */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 text-sm px-4 py-2 bg-primary/10 text-primary border-primary/30">
              Experience the Interface
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              See Features in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with beauty and simplicity in mind
            </p>
          </div>

          <div className="space-y-32">
            <FeatureMockup
              icon={Wallet}
              title="Real-Time Portfolio Dashboard"
              description="Track your entire portfolio at a glance. View live balances, performance charts, and quick actions all in one beautiful interface. Stay on top of your investments with instant insights."
              mockupContent={<DashboardMockup />}
            />

            <FeatureMockup
              icon={RefreshCw}
              title="AI-Powered DEX Aggregator"
              description="Get the best swap rates automatically. Our AI scans multiple DEXs including Jupiter, Raydium, and Orca to find you the optimal price with zero fees. Trade smarter, not harder."
              mockupContent={<SwapMockup />}
              reversed
            />

            <FeatureMockup
              icon={Coins}
              title="Effortless Staking & Rewards"
              description="Maximize your passive income with one-tap staking. Choose from top validators, track your rewards in real-time, and compound your earnings automatically. Your money working for you 24/7."
              mockupContent={<StakingMockup />}
            />

            <FeatureMockup
              icon={Layers}
              title="Premium NFT Gallery"
              description="Showcase your digital collection in style. Browse, organize, and trade NFTs with live floor prices and instant listing capabilities. Your art, perfectly presented."
              mockupContent={<NFTMockup />}
              reversed
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 text-sm px-4 py-2 bg-accent/10 text-accent border-accent/30">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything You Need in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">One Wallet</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From beginners to power users, SOLStack delivers professional-grade tools with consumer-friendly design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl w-fit group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                    <feature.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 text-sm px-4 py-2 bg-primary/10 text-primary border-primary/30">
              Advanced Capabilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Pro Features for <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Power Users</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 mx-auto p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl w-fit border border-primary/20">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 overflow-hidden">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/40">
                    Security First
                  </Badge>
                  <h2 className="text-4xl font-black mb-4">
                    Your Assets,<br />
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      100% Secure
                    </span>
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We never store your private keys. Your wallet is encrypted on your device with military-grade security protocols. 
                    Audited by leading security firms and trusted by millions.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>AES-256 encryption + secure enclave</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <span>Multi-factor authentication</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-primary" />
                      <span>Biometric + PIN protection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      <span>Hardware wallet compatible</span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-20 rounded-full" />
                  <div className="relative bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-primary/20">
                    <Smartphone className="w-full h-64 text-primary/20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Join the Future of Finance
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join millions of users worldwide who trust SOLStack for their crypto journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-6 shadow-xl"
            >
              <Download className="w-5 h-5" />
              Download Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Available on iOS 14+ and Android 10+
          </p>
        </div>
      </section>
    </div>
  );
};

export default WalletApp;
