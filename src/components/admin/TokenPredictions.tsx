import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Brain, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  Filter,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield
} from "lucide-react";
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
  riskScore: number;
  volume24h: number;
  marketCap?: number;
  liquidity?: number;
  volatility: number;
  timestamp: number;
  analysis: any;
}

interface AnalysisProgress {
  current: number;
  total: number;
  currentToken: string;
}

export const TokenPredictions = () => {
  const [predictions, setPredictions] = useState<TokenPrediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<TokenPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState("claude");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "confidence" | "volume" | "volatility">("score");
  const [minConfidence, setMinConfidence] = useState(50);
  const [minScore, setMinScore] = useState(50);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const { toast } = useToast();

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || predictions.length === 0) return;
    
    const intervalId = setInterval(() => {
      fetchAndAnalyzeTopTokens();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, predictions.length]);

  // Filter and sort predictions
  useEffect(() => {
    let filtered = [...predictions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply confidence filter
    filtered = filtered.filter(p => p.confidence >= minConfidence);

    // Apply score filter (using sniping score as default)
    filtered = filtered.filter(p => p.snipingScore >= minScore);

    // Apply risk filter
    if (showHighRiskOnly) {
      filtered = filtered.filter(p => p.riskScore >= 70);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.snipingScore - a.snipingScore;
        case "confidence":
          return b.confidence - a.confidence;
        case "volume":
          return b.volume24h - a.volume24h;
        case "volatility":
          return b.volatility - a.volatility;
        default:
          return 0;
      }
    });

    setFilteredPredictions(filtered);
  }, [predictions, searchTerm, minConfidence, minScore, showHighRiskOnly, sortBy]);

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
    setAnalysisProgress({ current: 0, total: 15, currentToken: "Initializing..." });
    
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
        .sort((a: any, b: any) => parseFloat(b.vol24h) - parseFloat(a.vol24h))
        .slice(0, 15);

      setAnalysisProgress({ current: 0, total: solTokens.length, currentToken: "Starting analysis..." });
      const analyzedTokens: TokenPrediction[] = [];

      for (let i = 0; i < solTokens.length; i++) {
        const token = solTokens[i];
        const [symbol] = token.instId.split("-");
        const currentPrice = parseFloat(token.last);
        const volume24h = parseFloat(token.vol24h);
        const priceChange24h = parseFloat(token.changeUtc) * 100;
        const high24h = parseFloat(token.high24h);
        const low24h = parseFloat(token.low24h);

        setAnalysisProgress({ current: i + 1, total: solTokens.length, currentToken: symbol });

        // Create market data for analysis
        const marketData = {
          price: currentPrice,
          volume24h,
          priceChange24h,
          high24h,
          low24h,
          timestamp: Date.now(),
        };

        // Get AI analysis
        const analysis = await analyzeToken(symbol, symbol, marketData);

        if (analysis) {
          // Calculate advanced metrics
          const volatility = Math.abs(priceChange24h);
          const priceRange = ((high24h - low24h) / low24h) * 100;
          const volumeScore = Math.min(volume24h / 1000000, 100);
          
          // Risk assessment
          const riskScore = Math.min(
            (volatility * 0.4 + priceRange * 0.3 + (100 - volumeScore) * 0.3),
            100
          );
          
          // Sniping score (for quick entries)
          const snipingScore = Math.min(
            (volatility * 0.4 + volumeScore * 0.3 + (analysis.confidence_level === "high" ? 30 : 20)),
            100
          );

          // Day trading score (for intraday movements)
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
            riskScore,
            volume24h,
            volatility,
            timestamp: Date.now(),
            analysis,
          });
        }
      }

      setPredictions(analyzedTokens);
      setAnalysisProgress(null);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${analyzedTokens.length} tokens with ${aiModel.toUpperCase()}`,
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
      setAnalysisProgress(null);
    }
  };

  const exportAnalysis = () => {
    const csvData = filteredPredictions.map(p => ({
      Symbol: p.symbol,
      "Current Price": p.currentPrice,
      "24h Prediction": p.prediction24h,
      "7d Prediction": p.prediction7d,
      "30d Prediction": p.prediction30d,
      "Confidence %": p.confidence,
      Sentiment: p.sentiment,
      "Sniping Score": p.snipingScore.toFixed(1),
      "Day Trading Score": p.dayTradingScore.toFixed(1),
      "Risk Score": p.riskScore.toFixed(1),
      "Volume 24h": p.volume24h,
      "Volatility %": p.volatility.toFixed(2),
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crypto-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    
    toast({
      title: "Export Complete",
      description: `Exported ${filteredPredictions.length} token analyses`,
    });
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

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 70) return { variant: "destructive" as const, label: "High Risk", icon: AlertTriangle };
    if (riskScore >= 40) return { variant: "default" as const, label: "Medium Risk", icon: Activity };
    return { variant: "secondary" as const, label: "Low Risk", icon: Shield };
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                AI-Powered Crypto Analysis Dashboard
              </CardTitle>
              <CardDescription>
                Real-time market intelligence with advanced predictive analytics
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={aiModel} onValueChange={setAiModel} disabled={loading}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Claude Sonnet 4
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      GPT-4o Mini
                    </div>
                  </SelectItem>
                  <SelectItem value="perplexity">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Perplexity
                    </div>
                  </SelectItem>
                  <SelectItem value="grok">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Grok
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {predictions.length > 0 && (
                <Button onClick={exportAnalysis} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
              <Button onClick={fetchAndAnalyzeTopTokens} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Analysis Progress */}
        {analysisProgress && (
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Analyzing {analysisProgress.currentToken}...
              </span>
              <span className="font-semibold">
                {analysisProgress.current} / {analysisProgress.total}
              </span>
            </div>
            <Progress value={(analysisProgress.current / analysisProgress.total) * 100} />
          </CardContent>
        )}

        {/* Auto-refresh Controls */}
        {predictions.length > 0 && !loading && (
          <CardContent className="border-t pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="cursor-pointer">
                  Auto-refresh every {Math.floor(refreshInterval / 60)} minutes
                </Label>
              </div>
              {autoRefresh && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={(v) => setRefreshInterval(parseInt(v))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                      <SelectItem value="900">15 minutes</SelectItem>
                      <SelectItem value="1800">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      {predictions.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters & Sorting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by token symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Sniping Score</SelectItem>
                    <SelectItem value="confidence">AI Confidence</SelectItem>
                    <SelectItem value="volume">Trading Volume</SelectItem>
                    <SelectItem value="volatility">Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Confidence */}
              <div className="space-y-2">
                <Label>Min Confidence: {minConfidence}%</Label>
                <Slider
                  value={[minConfidence]}
                  onValueChange={([v]) => setMinConfidence(v)}
                  min={0}
                  max={100}
                  step={5}
                  className="pt-2"
                />
              </div>

              {/* Minimum Score */}
              <div className="space-y-2">
                <Label>Min Score: {minScore}%</Label>
                <Slider
                  value={[minScore]}
                  onValueChange={([v]) => setMinScore(v)}
                  min={0}
                  max={100}
                  step={5}
                  className="pt-2"
                />
              </div>

              {/* High Risk Filter */}
              <div className="space-y-2">
                <Label htmlFor="high-risk" className="block">High Risk Only</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="high-risk"
                    checked={showHighRiskOnly}
                    onCheckedChange={setShowHighRiskOnly}
                  />
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              Showing {filteredPredictions.length} of {predictions.length} tokens
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {filteredPredictions.length > 0 && (
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">Price Predictions</TabsTrigger>
            <TabsTrigger value="sniping">Sniping Opportunities</TabsTrigger>
            <TabsTrigger value="daytrading">Day Trading</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            {filteredPredictions.map((token) => {
              const risk = getRiskBadge(token.riskScore);
              const RiskIcon = risk.icon;
              
              return (
              <Card key={token.symbol} className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {token.symbol}
                          {getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? (
                            <ArrowUpRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-lg font-semibold">
                          ${token.currentPrice.toFixed(6)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getSentimentColor(token.sentiment)} variant="outline">
                        {token.sentiment.toUpperCase()}
                      </Badge>
                      <Badge variant={risk.variant}>
                        <RiskIcon className="w-3 h-3 mr-1" />
                        {risk.label}
                      </Badge>
                      <Badge variant="secondary">
                        <Brain className="w-3 h-3 mr-1" />
                        {token.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Predictions */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        24h Prediction
                      </p>
                      <p className="text-xl font-bold">
                        ${token.prediction24h.toFixed(6)}
                      </p>
                      <p className={`text-sm font-semibold flex items-center gap-1 ${getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(getPredictionChange(token.currentPrice, token.prediction24h)).toFixed(2)}%
                      </p>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        7d Prediction
                      </p>
                      <p className="text-xl font-bold">
                        ${token.prediction7d.toFixed(6)}
                      </p>
                      <p className={`text-sm font-semibold flex items-center gap-1 ${getPredictionChange(token.currentPrice, token.prediction7d) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {getPredictionChange(token.currentPrice, token.prediction7d) >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(getPredictionChange(token.currentPrice, token.prediction7d)).toFixed(2)}%
                      </p>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        30d Prediction
                      </p>
                      <p className="text-xl font-bold">
                        ${token.prediction30d.toFixed(6)}
                      </p>
                      <p className={`text-sm font-semibold flex items-center gap-1 ${getPredictionChange(token.currentPrice, token.prediction30d) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {getPredictionChange(token.currentPrice, token.prediction30d) >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(getPredictionChange(token.currentPrice, token.prediction30d)).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Market Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Volume 24h</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${(token.volume24h / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Volatility</p>
                      <p className="text-sm font-semibold">{token.volatility.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Sniping Score</p>
                      <p className={`text-sm font-semibold ${getScoreColor(token.snipingScore)}`}>
                        {token.snipingScore.toFixed(0)}/100
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Day Trade Score</p>
                      <p className={`text-sm font-semibold ${getScoreColor(token.dayTradingScore)}`}>
                        {token.dayTradingScore.toFixed(0)}/100
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </TabsContent>

          <TabsContent value="sniping" className="space-y-4">
            {[...filteredPredictions]
              .sort((a, b) => b.snipingScore - a.snipingScore)
              .map((token) => {
                const risk = getRiskBadge(token.riskScore);
                const RiskIcon = risk.icon;
                return (
                <Card key={token.symbol} className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Zap className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{token.symbol}</CardTitle>
                          <CardDescription className="text-lg font-semibold">
                            ${token.currentPrice.toFixed(6)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Sniping Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(token.snipingScore)}`}>
                          {token.snipingScore.toFixed(0)}
                          <span className="text-lg text-muted-foreground">/100</span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Volume Change</span>
                          <span className={`text-sm font-bold ${token.volumeChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {token.volumeChange >= 0 ? "+" : ""}{token.volumeChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">AI Confidence</span>
                          <span className="text-sm font-bold">{token.confidence}%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Expected Gain</span>
                          <span className={`text-sm font-bold ${getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "+" : ""}
                            {getPredictionChange(token.currentPrice, token.prediction24h).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Risk Level</span>
                          <Badge variant={risk.variant} className="text-xs">
                            <RiskIcon className="w-3 h-3 mr-1" />
                            {risk.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Volatility Index</p>
                      <Progress value={token.volatility} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{token.volatility.toFixed(2)}%</p>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
          </TabsContent>

          <TabsContent value="daytrading" className="space-y-4">
            {[...filteredPredictions]
              .sort((a, b) => b.dayTradingScore - a.dayTradingScore)
              .map((token) => {
                const risk = getRiskBadge(token.riskScore);
                const RiskIcon = risk.icon;
                return (
                <Card key={token.symbol} className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Target className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{token.symbol}</CardTitle>
                          <CardDescription className="text-lg font-semibold">
                            ${token.currentPrice.toFixed(6)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Day Trading Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(token.dayTradingScore)}`}>
                          {token.dayTradingScore.toFixed(0)}
                          <span className="text-lg text-muted-foreground">/100</span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Market Sentiment</span>
                          <Badge className={getSentimentColor(token.sentiment)} variant="outline">
                            {token.sentiment.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Entry Signal</span>
                          <span className={`text-sm font-bold ${token.dayTradingScore >= 75 ? "text-green-500" : token.dayTradingScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                            {token.dayTradingScore >= 75 ? "STRONG" : token.dayTradingScore >= 50 ? "MODERATE" : "WEAK"}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Expected Move</span>
                          <span className={`text-sm font-bold flex items-center gap-1 ${getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {getPredictionChange(token.currentPrice, token.prediction24h) >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {Math.abs(getPredictionChange(token.currentPrice, token.prediction24h)).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Risk Assessment</span>
                          <Badge variant={risk.variant} className="text-xs">
                            <RiskIcon className="w-3 h-3 mr-1" />
                            {risk.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">24h Volume</span>
                        <span className="font-semibold">${(token.volume24h / 1000000).toFixed(2)}M</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">AI Confidence</span>
                        <div className="flex items-center gap-2">
                          <Progress value={token.confidence} className="w-20 h-2" />
                          <span className="font-semibold">{token.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {predictions.length === 0 && !loading && !analysisProgress && (
        <Card className="bg-card/50 backdrop-blur-sm border-dashed">
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Crypto Intelligence</h3>
                <p className="text-muted-foreground">
                  Click "Start Analysis" to begin comprehensive market analysis with advanced AI models. 
                  Get real-time predictions, risk assessments, and trading opportunities.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Price Predictions
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Risk Analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Trading Signals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results After Filtering */}
      {predictions.length > 0 && filteredPredictions.length === 0 && !loading && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
