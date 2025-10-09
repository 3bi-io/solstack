import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Zap, Target, Brain, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TokenPrediction {
  symbol: string;
  address: string;
  currentPrice: number;
  prediction24h: number;
  prediction7d: number;
  prediction30d: number;
  confidence: number;
  sentiment: string;
  volumeChange: number;
  snipingScore: number;
  dayTradingScore: number;
  analysis: any;
}

export const TokenPredictions = () => {
  const [predictions, setPredictions] = useState<TokenPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState("claude");
  const { toast } = useToast();

  const analyzeToken = async (tokenAddress: string, tokenSymbol: string, marketData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-market-analysis", {
        body: {
          tokenAddress,
          tokenSymbol,
          marketData,
          analysisType: "price_prediction",
          aiModel,
        },
      });

      if (error) throw error;
      return data.analysis;
    } catch (error) {
      console.error("Error analyzing token:", error);
      return null;
    }
  };

  const fetchAndAnalyzeTopTokens = async () => {
    setLoading(true);
    try {
      // Fetch top tokens from OKX
      const response = await fetch(
        "https://www.okx.com/api/v5/market/tickers?instType=SPOT"
      );
      const data = await response.json();

      if (data.code !== "0") throw new Error("Failed to fetch tokens");

      // Filter for SOL pairs and high volume tokens
      const solTokens = data.data
        .filter((token: any) => token.instId.includes("SOL"))
        .slice(0, 10);

      const analyzedTokens: TokenPrediction[] = [];

      for (const token of solTokens) {
        const [symbol] = token.instId.split("-");
        const currentPrice = parseFloat(token.last);
        const volume24h = parseFloat(token.vol24h);
        const priceChange24h = parseFloat(token.changeUtc) * 100;

        // Create market data for analysis
        const marketData = {
          price: currentPrice,
          volume24h,
          priceChange24h,
          high24h: parseFloat(token.high24h),
          low24h: parseFloat(token.low24h),
          timestamp: Date.now(),
        };

        // Get AI analysis
        const analysis = await analyzeToken(symbol, symbol, marketData);

        if (analysis) {
          // Calculate sniping and day trading scores
          const volatility = Math.abs(priceChange24h);
          const volumeScore = Math.min(volume24h / 1000000, 100);
          
          const snipingScore = Math.min(
            (volatility * 0.4 + volumeScore * 0.3 + (analysis.confidence_level === "high" ? 30 : 20)),
            100
          );

          const dayTradingScore = Math.min(
            (volatility * 0.3 + volumeScore * 0.4 + (analysis.momentum === "strong" ? 30 : 20)),
            100
          );

          analyzedTokens.push({
            symbol,
            address: symbol,
            currentPrice,
            prediction24h: analysis.predictions?.["24h"] || currentPrice,
            prediction7d: analysis.predictions?.["7d"] || currentPrice,
            prediction30d: analysis.predictions?.["30d"] || currentPrice,
            confidence: analysis.confidence_level === "high" ? 85 : analysis.confidence_level === "medium" ? 65 : 45,
            sentiment: analysis.sentiment || "neutral",
            volumeChange: priceChange24h,
            snipingScore,
            dayTradingScore,
            analysis,
          });
        }
      }

      setPredictions(analyzedTokens);
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${analyzedTokens.length} tokens successfully`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPredictionChange = (current: number, predicted: number) => {
    return ((predicted - current) / current) * 100;
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      bullish: "text-green-500",
      bearish: "text-red-500",
      neutral: "text-yellow-500",
    };
    return colors[sentiment.toLowerCase()] || "text-muted-foreground";
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                AI Token Predictions & Trading Insights
              </CardTitle>
              <CardDescription>
                Advanced market analysis powered by AI for optimal trading decisions
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude Sonnet 4</SelectItem>
                  <SelectItem value="gpt">GPT-4o Mini</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                  <SelectItem value="grok">Grok</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAndAnalyzeTopTokens} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Tokens
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {predictions.length > 0 && (
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">Price Predictions</TabsTrigger>
            <TabsTrigger value="sniping">Sniping Opportunities</TabsTrigger>
            <TabsTrigger value="daytrading">Day Trading</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            {predictions.map((token) => (
              <Card key={token.symbol} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{token.symbol}</CardTitle>
                      <CardDescription>${token.currentPrice.toFixed(4)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(token.sentiment)}>
                        {token.sentiment}
                      </Badge>
                      <Badge variant="outline">{token.confidence}% confidence</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">24h Prediction</p>
                      <p className="text-lg font-semibold">
                        ${token.prediction24h.toFixed(4)}
                      </p>
                      <p className={`text-sm ${getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "+" : ""}
                        {getPredictionChange(token.currentPrice, token.prediction24h).toFixed(2)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">7d Prediction</p>
                      <p className="text-lg font-semibold">
                        ${token.prediction7d.toFixed(4)}
                      </p>
                      <p className={`text-sm ${getPredictionChange(token.currentPrice, token.prediction7d) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {getPredictionChange(token.currentPrice, token.prediction7d) >= 0 ? "+" : ""}
                        {getPredictionChange(token.currentPrice, token.prediction7d).toFixed(2)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">30d Prediction</p>
                      <p className="text-lg font-semibold">
                        ${token.prediction30d.toFixed(4)}
                      </p>
                      <p className={`text-sm ${getPredictionChange(token.currentPrice, token.prediction30d) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {getPredictionChange(token.currentPrice, token.prediction30d) >= 0 ? "+" : ""}
                        {getPredictionChange(token.currentPrice, token.prediction30d).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="sniping" className="space-y-4">
            {[...predictions]
              .sort((a, b) => b.snipingScore - a.snipingScore)
              .map((token) => (
                <Card key={token.symbol} className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <div>
                          <CardTitle className="text-lg">{token.symbol}</CardTitle>
                          <CardDescription>${token.currentPrice.toFixed(4)}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Sniping Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(token.snipingScore)}`}>
                          {token.snipingScore.toFixed(0)}/100
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">24h Volume Change</span>
                        <span className={`text-sm font-semibold ${token.volumeChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {token.volumeChange >= 0 ? "+" : ""}{token.volumeChange.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AI Confidence</span>
                        <span className="text-sm font-semibold">{token.confidence}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Expected Gain (24h)</span>
                        <span className={`text-sm font-semibold ${getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {getPredictionChange(token.currentPrice, token.prediction24h).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="daytrading" className="space-y-4">
            {[...predictions]
              .sort((a, b) => b.dayTradingScore - a.dayTradingScore)
              .map((token) => (
                <Card key={token.symbol} className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-lg">{token.symbol}</CardTitle>
                          <CardDescription>${token.currentPrice.toFixed(4)}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Day Trading Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(token.dayTradingScore)}`}>
                          {token.dayTradingScore.toFixed(0)}/100
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Market Sentiment</span>
                        <Badge className={getSentimentColor(token.sentiment)}>
                          {token.sentiment}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Entry Opportunity</span>
                        <span className={`text-sm font-semibold ${token.dayTradingScore >= 75 ? "text-green-500" : token.dayTradingScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                          {token.dayTradingScore >= 75 ? "Strong" : token.dayTradingScore >= 50 ? "Moderate" : "Weak"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Expected Movement</span>
                        <span className={`text-sm font-semibold ${getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                          {Math.abs(getPredictionChange(token.currentPrice, token.prediction24h)).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      )}

      {predictions.length === 0 && !loading && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Click "Analyze Tokens" to get AI-powered predictions and trading insights
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
