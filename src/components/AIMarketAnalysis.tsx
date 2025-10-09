import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, Target, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIMarketAnalysisProps {
  tokenAddress: string;
  tokenSymbol: string;
  marketData: any;
}

export const AIMarketAnalysis = ({ tokenAddress, tokenSymbol, marketData }: AIMarketAnalysisProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt');
  const [analysisResults, setAnalysisResults] = useState<{
    market_overview?: any;
    price_prediction?: any;
    trading_insights?: any;
  }>({});

  const runAnalysis = async (analysisType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-market-analysis', {
        body: {
          tokenAddress,
          tokenSymbol,
          marketData,
          analysisType,
          aiModel: selectedModel,
        },
      });

      if (error) throw error;

      setAnalysisResults(prev => ({
        ...prev,
        [analysisType]: data.analysis,
      }));

      toast({
        title: "Analysis Complete",
        description: `${analysisType.replace('_', ' ')} generated successfully`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (!sentiment) return "secondary";
    const s = sentiment.toLowerCase();
    if (s.includes('bullish')) return "default";
    if (s.includes('bearish')) return "destructive";
    return "secondary";
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Market Analysis
            </CardTitle>
            <CardDescription>
              Powered by advanced AI models for {tokenSymbol}
            </CardDescription>
          </div>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt">GPT-4o Mini</SelectItem>
              <SelectItem value="claude">Claude Sonnet 4</SelectItem>
              <SelectItem value="perplexity">Perplexity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="prediction">Price Prediction</TabsTrigger>
            <TabsTrigger value="insights">Trading Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Button
              onClick={() => runAnalysis('market_overview')}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Market Overview
                </>
              )}
            </Button>

            {analysisResults.market_overview && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sentiment:</span>
                  <Badge variant={getSentimentColor(analysisResults.market_overview.analysis_result?.sentiment)}>
                    {analysisResults.market_overview.analysis_result?.sentiment || 'N/A'}
                  </Badge>
                  {analysisResults.market_overview.sentiment_score && (
                    <span className="text-sm text-muted-foreground">
                      Score: {(analysisResults.market_overview.sentiment_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {analysisResults.market_overview.analysis_result?.technicals && (
                    <div>
                      <h4 className="font-semibold mb-2">Technical Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.market_overview.analysis_result.technicals}
                      </p>
                    </div>
                  )}

                  {analysisResults.market_overview.analysis_result?.volume_analysis && (
                    <div>
                      <h4 className="font-semibold mb-2">Volume Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.market_overview.analysis_result.volume_analysis}
                      </p>
                    </div>
                  )}

                  {analysisResults.market_overview.analysis_result?.risks && (
                    <div>
                      <h4 className="font-semibold mb-2 text-destructive">Risk Factors</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.market_overview.analysis_result.risks}
                      </p>
                    </div>
                  )}

                  {analysisResults.market_overview.analysis_result?.outlook && (
                    <div>
                      <h4 className="font-semibold mb-2">Short-term Outlook</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.market_overview.analysis_result.outlook}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4">
            <Button
              onClick={() => runAnalysis('price_prediction')}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Price Prediction
                </>
              )}
            </Button>

            {analysisResults.price_prediction && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="grid grid-cols-3 gap-4">
                  {analysisResults.price_prediction.analysis_result?.predictions?.['24h'] && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">24h Prediction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          ${analysisResults.price_prediction.analysis_result.predictions['24h']}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {analysisResults.price_prediction.analysis_result?.predictions?.['7d'] && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">7d Prediction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          ${analysisResults.price_prediction.analysis_result.predictions['7d']}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {analysisResults.price_prediction.analysis_result?.predictions?.['30d'] && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">30d Prediction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          ${analysisResults.price_prediction.analysis_result.predictions['30d']}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {analysisResults.price_prediction.confidence_level && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <Badge>{analysisResults.price_prediction.confidence_level}</Badge>
                  </div>
                )}

                <div className="space-y-3">
                  {analysisResults.price_prediction.analysis_result?.trend_analysis && (
                    <div>
                      <h4 className="font-semibold mb-2">Trend Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.price_prediction.analysis_result.trend_analysis}
                      </p>
                    </div>
                  )}

                  {analysisResults.price_prediction.analysis_result?.support_resistance && (
                    <div>
                      <h4 className="font-semibold mb-2">Support & Resistance</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.price_prediction.analysis_result.support_resistance}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Button
              onClick={() => runAnalysis('trading_insights')}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Generate Trading Insights
                </>
              )}
            </Button>

            {analysisResults.trading_insights && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="grid grid-cols-2 gap-4">
                  {analysisResults.trading_insights.analysis_result?.entry_points && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-green-500">Entry Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {analysisResults.trading_insights.analysis_result.entry_points}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {analysisResults.trading_insights.analysis_result?.exit_points && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-red-500">Exit Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {analysisResults.trading_insights.analysis_result.exit_points}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-3">
                  {analysisResults.trading_insights.analysis_result?.stop_loss && (
                    <div>
                      <h4 className="font-semibold mb-2">Stop Loss</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.trading_insights.analysis_result.stop_loss}
                      </p>
                    </div>
                  )}

                  {analysisResults.trading_insights.analysis_result?.risk_reward && (
                    <div>
                      <h4 className="font-semibold mb-2">Risk/Reward Ratio</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.trading_insights.analysis_result.risk_reward}
                      </p>
                    </div>
                  )}

                  {analysisResults.trading_insights.analysis_result?.strategy && (
                    <div>
                      <h4 className="font-semibold mb-2">Trading Strategy</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.trading_insights.analysis_result.strategy}
                      </p>
                    </div>
                  )}

                  {analysisResults.trading_insights.analysis_result?.key_levels && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Levels to Watch</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResults.trading_insights.analysis_result.key_levels}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};