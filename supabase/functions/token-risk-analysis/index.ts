import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  score: number; // 0-100, lower is safer
  factors: string[];
  summary: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokens } = await req.json() as { tokens: TokenData[] };
    
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tokens provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format token data for AI analysis
    const tokenSummary = tokens.slice(0, 10).map(t => ({
      pair: t.instId,
      symbol: t.symbol,
      price: t.price,
      change24h: t.priceChange24h,
      volume24h: t.volume24h,
      volatility: t.high24h && t.low24h ? ((t.high24h - t.low24h) / t.low24h * 100).toFixed(2) : 'N/A'
    }));

    console.log('Analyzing tokens:', tokenSummary.map(t => t.pair).join(', '));

    const systemPrompt = `You are an expert cryptocurrency risk analyst specializing in DeFi and trading pair analysis. Your role is to assess the risk level of trading pairs based on market data.

Analyze each token pair and assign a risk level:
- "Low": Stable, high liquidity, established pairs with <5% daily volatility
- "Med": Moderate volatility (5-15%), decent volume, some uncertainty
- "High": High volatility (>15%), low volume, potential manipulation risk, new/unknown tokens

Consider these factors:
1. Price volatility (24h change magnitude)
2. Trading volume (higher = safer)
3. Price range spread (high-low difference)
4. Token type (major coins vs altcoins)
5. Market manipulation indicators`;

    const userPrompt = `Analyze these trading pairs and provide risk assessments:

${JSON.stringify(tokenSummary, null, 2)}

Respond with a JSON object where keys are the pair names (instId) and values have:
- level: "Low", "Med", or "High"
- score: 0-100 (lower is safer)
- factors: array of 1-3 key risk factors
- summary: one sentence explanation

Example format:
{
  "BTC-USDT": {"level": "Low", "score": 15, "factors": ["High liquidity", "Established asset"], "summary": "Major trading pair with excellent liquidity."},
  "NEWCOIN-USDT": {"level": "High", "score": 85, "factors": ["Low volume", "High volatility"], "summary": "New token with significant price swings."}
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return fallback heuristic analysis
      const fallbackAnalysis = generateFallbackAnalysis(tokens);
      return new Response(
        JSON.stringify({ riskAnalysis: fallbackAnalysis, source: 'heuristic' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('Empty AI response');
      const fallbackAnalysis = generateFallbackAnalysis(tokens);
      return new Response(
        JSON.stringify({ riskAnalysis: fallbackAnalysis, source: 'heuristic' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse AI response - handle markdown code blocks
    let riskAnalysis: Record<string, RiskAnalysis>;
    try {
      let jsonStr = aiResponse;
      // Remove markdown code blocks if present
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      riskAnalysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, aiResponse);
      const fallbackAnalysis = generateFallbackAnalysis(tokens);
      return new Response(
        JSON.stringify({ riskAnalysis: fallbackAnalysis, source: 'heuristic' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI analysis complete for', Object.keys(riskAnalysis).length, 'pairs');

    return new Response(
      JSON.stringify({ riskAnalysis, source: 'ai' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in token-risk-analysis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback heuristic analysis when AI is unavailable
function generateFallbackAnalysis(tokens: TokenData[]): Record<string, RiskAnalysis> {
  const analysis: Record<string, RiskAnalysis> = {};
  
  for (const token of tokens) {
    const absChange = Math.abs(token.priceChange24h);
    const volume = token.volume24h;
    
    let level: 'Low' | 'Med' | 'High';
    let score: number;
    const factors: string[] = [];
    
    // Major pairs are generally safer
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
      factors.push('Elevated risk');
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
      summary: `${level} risk based on ${absChange.toFixed(1)}% 24h change and volume metrics.`
    };
  }
  
  return analysis;
}
