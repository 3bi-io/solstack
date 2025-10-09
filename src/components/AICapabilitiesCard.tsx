import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AICapabilitiesCard = () => {
  const navigate = useNavigate();

  const aiFeatures = [
    {
      icon: Brain,
      title: "Market Analysis",
      description: "AI-powered sentiment analysis and market insights",
      color: "text-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Price Predictions",
      description: "24h, 7d, and 30d price forecasts with confidence scores",
      color: "text-blue-500",
    },
    {
      icon: Target,
      title: "Trading Insights",
      description: "Entry/exit points, stop-loss, and risk/reward analysis",
      color: "text-green-500",
    },
  ];

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-background border-purple-500/20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-green-500/5 animate-gradient" />
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30">
            <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
            Powered by AI
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
            AI-Powered Market Intelligence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leverage Claude, GPT-4, Perplexity, and Grok for deep market analysis, price predictions, and trading strategies
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="group p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105"
            >
              <feature.icon className={`w-8 h-8 mb-3 ${feature.color} group-hover:scale-110 transition-transform`} />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* AI Models */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Badge variant="outline" className="gap-1">
            <Brain className="w-3 h-3" />
            Claude Sonnet 4
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Brain className="w-3 h-3" />
            GPT-4o Mini
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Brain className="w-3 h-3" />
            Perplexity
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Brain className="w-3 h-3" />
            Grok (xAI)
          </Badge>
        </div>

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            onClick={() => navigate("/markets")}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Explore AI Analysis
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};