import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp
} from "lucide-react";
import solstackLogo from "@/assets/solstack-logo.png";

const WalletApp = () => {
  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "Your keys, your crypto. Protected by advanced encryption and biometric authentication."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades and transfers in milliseconds on the Solana blockchain."
    },
    {
      icon: Fingerprint,
      title: "Biometric Lock",
      description: "Face ID and fingerprint authentication for instant secure access."
    },
    {
      icon: Globe,
      title: "Multi-Chain Support",
      description: "Manage Solana, SPL tokens, and NFTs all in one beautiful interface."
    },
    {
      icon: Lock,
      title: "Self-Custody",
      description: "You control your private keys. We never have access to your funds."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Track your portfolio performance with live market data and insights."
    }
  ];

  const stats = [
    { icon: Users, value: "100K+", label: "Active Users" },
    { icon: Star, value: "4.9", label: "App Store Rating" },
    { icon: Download, value: "500K+", label: "Downloads" }
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
              The most secure and user-friendly Solana wallet for iOS and Android. 
              Your gateway to the future of finance.
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

      {/* Features Grid */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Built for <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Everyone</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a crypto beginner or a seasoned trader, SOLStack Wallet provides everything you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
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
                    We never store your private keys. Your wallet is encrypted on your device with military-grade security protocols. Only you have access to your funds.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>End-to-end encryption</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <span>Biometric authentication</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-primary" />
                      <span>Self-custody wallet</span>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users managing their crypto with confidence.
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
