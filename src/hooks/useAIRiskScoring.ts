import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TokenData {
  symbol: string;
  instId: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
}

interface RiskAnalysis {
  level: 'Low' | 'Med' | 'High';
  score: number;
  factors: string[];
  summary: string;
}

interface UseAIRiskScoringResult {
  riskScores: Record<string, RiskAnalysis>;
  isAnalyzing: boolean;
  analyzeTokens: (tokens: TokenData[]) => Promise<void>;
  getRiskForToken: (instId: string) => RiskAnalysis | null;
  source: 'ai' | 'heuristic' | null;
}

export function useAIRiskScoring(): UseAIRiskScoringResult {
  const [riskScores, setRiskScores] = useState<Record<string, RiskAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [source, setSource] = useState<'ai' | 'heuristic' | null>(null);

  const analyzeTokens = useCallback(async (tokens: TokenData[]) => {
    if (tokens.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('token-risk-analysis', {
        body: { tokens }
      });

      if (error) {
        console.error('Risk analysis error:', error);
        
        // Check for specific error types
        if (error.message?.includes('429')) {
          toast({
            title: 'Rate Limited',
            description: 'AI analysis is temporarily unavailable. Using heuristic scoring.',
            variant: 'destructive',
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: 'AI Credits Exhausted',
            description: 'Using fallback risk analysis.',
            variant: 'destructive',
          });
        }
        
        // Generate local fallback
        const fallback = generateLocalFallback(tokens);
        setRiskScores(fallback);
        setSource('heuristic');
        return;
      }

      if (data?.riskAnalysis) {
        setRiskScores(prev => ({ ...prev, ...data.riskAnalysis }));
        setSource(data.source || 'ai');
        
        if (data.source === 'ai') {
          console.log('AI risk analysis complete');
        }
      }
    } catch (err) {
      console.error('Failed to analyze tokens:', err);
      const fallback = generateLocalFallback(tokens);
      setRiskScores(fallback);
      setSource('heuristic');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getRiskForToken = useCallback((instId: string): RiskAnalysis | null => {
    return riskScores[instId] || null;
  }, [riskScores]);

  return {
    riskScores,
    isAnalyzing,
    analyzeTokens,
    getRiskForToken,
    source
  };
}

// Local fallback when edge function fails
function generateLocalFallback(tokens: TokenData[]): Record<string, RiskAnalysis> {
  const analysis: Record<string, RiskAnalysis> = {};
  
  for (const token of tokens) {
    const absChange = Math.abs(token.priceChange24h);
    const volume = token.volume24h;
    
    let level: 'Low' | 'Med' | 'High';
    let score: number;
    const factors: string[] = [];
    
    const isMajor = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA'].some(
      major => token.instId.includes(major)
    );
    
    if (isMajor && absChange < 5) {
      level = 'Low';
      score = 10 + absChange * 2;
      factors.push('Established asset');
      if (volume > 1000000) factors.push('High liquidity');
    } else if (absChange > 15 || volume < 100000) {
      level = 'High';
      score = 70 + Math.min(absChange, 30);
      if (absChange > 15) factors.push('High volatility');
      if (volume < 100000) factors.push('Low volume');
    } else {
      level = 'Med';
      score = 35 + absChange;
      factors.push('Moderate volatility');
      if (!isMajor) factors.push('Altcoin');
    }
    
    analysis[token.instId] = {
      level,
      score: Math.min(100, Math.max(0, Math.round(score))),
      factors: factors.slice(0, 3),
      summary: `${level} risk based on market metrics.`
    };
  }
  
  return analysis;
}
