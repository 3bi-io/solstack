import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Zap,
  LineChart,
  Bot,
  Search,
  ArrowRight,
  Activity,
  Target,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const GrokAnalysis = () => {
  const { user } = useAuth();
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisType, setAnalysisType] = useState<"market_overview" | "price_prediction" | "trading_insights">("market_overview");

  const analyzeToken = async () => {
    if (!tokenAddress.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a token address or symbol",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use Grok analysis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-market-analysis", {
        body: {
          tokenAddress: tokenAddress,
          tokenSymbol: tokenSymbol || tokenAddress,
          marketData: {
            price: 0,
            volume24h: 0,
            marketCap: 0,
            change24h: 0,
          },
          analysisType,
          aiModel: "grok",
        },
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Grok has analyzed the token successfully",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-background border-primary/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-primary/20 rounded-2xl backdrop-blur-sm">
                <Brain className="w-12 h-12 text-primary" />
              </div>
              <div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Grok AI Analysis
                </CardTitle>
                <CardDescription className="text-lg mt-2 text-foreground/80">
                  Advanced cryptocurrency analysis powered by Grok's cutting-edge AI
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
                <Sparkles className="w-4 h-4" />
                Real-time Insights
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
                <TrendingUp className="w-4 h-4" />
                Price Predictions
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
                <Activity className="w-4 h-4" />
                Market Sentiment
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-4 py-1.5">
                <Target className="w-4 h-4" />
                Trading Strategies
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Analysis Input */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-primary" />
              <CardTitle>Analyze a Token</CardTitle>
            </div>
            <CardDescription>
              Enter a token address or symbol to get comprehensive AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Token Address / Contract</label>
                <Input
                  placeholder="e.g., So11111111111111111111111111111111111111112"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Token Symbol (Optional)</label>
                <Input
                  placeholder="e.g., SOL, BTC, ETH"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  className="uppercase"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Analysis Type</label>
              <Tabs value={analysisType} onValueChange={(v: any) => setAnalysisType(v)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="market_overview" className="gap-2">
                    <LineChart className="w-4 h-4" />
                    Market Overview
                  </TabsTrigger>
                  <TabsTrigger value="price_prediction" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Price Prediction
                  </TabsTrigger>
                  <TabsTrigger value="trading_insights" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Trading Insights
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Button 
              onClick={analyzeToken}
              disabled={loading || !tokenAddress}
              className="w-full gap-2 h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Bot className="w-5 h-5 animate-pulse" />
                  Analyzing with Grok...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Analysis
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Grok Analysis Results</CardTitle>
                    <CardDescription>
                      Token: {tokenSymbol || tokenAddress}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  AI Powered
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysis.sentiment_score && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Sentiment Score</span>
                    <Badge 
                      variant={analysis.sentiment_score > 0.6 ? "default" : "secondary"}
                      className="gap-1"
                    >
                      <Activity className="w-3 h-3" />
                      {(analysis.sentiment_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${analysis.sentiment_score * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {analysis.analysis_result && (
                <div className="space-y-4">
                  {analysis.analysis_result.sentiment && (
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Market Sentiment
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {analysis.analysis_result.sentiment}
                      </p>
                    </div>
                  )}

                  {analysis.analysis_result.summary && (
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        Analysis Summary
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.analysis_result.summary}
                      </p>
                    </div>
                  )}

                  {analysis.analysis_result.predictions && (
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Price Predictions
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(analysis.analysis_result.predictions).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                            <Badge variant="outline">{value}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.analysis_result.trading_strategy && (
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Trading Strategy
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.analysis_result.trading_strategy}
                      </p>
                    </div>
                  )}

                  {analysis.analysis_result.risk_factors && (
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        Risk Factors
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.analysis_result.risk_factors}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <CardHeader>
              <Brain className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-lg">Advanced AI</CardTitle>
              <CardDescription>
                Powered by Grok's latest AI model with deep market understanding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Zap className="w-10 h-10 text-accent mb-2" />
              <CardTitle className="text-lg">Real-time Data</CardTitle>
              <CardDescription>
                Analyzes live market data for the most accurate predictions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <Target className="w-10 h-10 text-primary mb-2" />
              <CardTitle className="text-lg">Actionable Insights</CardTitle>
              <CardDescription>
                Get clear trading strategies and risk assessments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <TelegramNavigation />
    </div>
  );
};

export default GrokAnalysis;
