import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const claudeKey = Deno.env.get('CLAUDE_API_KEY');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    const grokKey = Deno.env.get('GROK_API_KEY');

    // Auth is optional - allow public access but save to DB if user is logged in
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    });
    
    let user = null;
    if (authHeader) {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (!userError && authUser) {
        user = authUser;
        console.log('Authenticated user:', user.id);
      }
    }

    const { tokenAddress, tokenSymbol, marketData, analysisType, aiModel } = await req.json();

    console.log(`Starting ${analysisType} analysis for ${tokenSymbol} using ${aiModel}`);

    let analysisResult;
    let sentimentScore = null;
    let pricePrediction = null;
    let confidenceLevel = null;

    // Prepare analysis prompt based on type
    const prompts = {
      market_overview: `Analyze this cryptocurrency market data for ${tokenSymbol}:
${JSON.stringify(marketData, null, 2)}

Provide:
1. Current market sentiment (bullish/bearish/neutral)
2. Key technical indicators analysis
3. Volume and liquidity assessment
4. Risk factors
5. Short-term outlook (24-48h)

Format as JSON with: sentiment, technicals, volume_analysis, risks, outlook`,

      price_prediction: `Based on this market data for ${tokenSymbol}, provide a price prediction:
${JSON.stringify(marketData, null, 2)}

Analyze:
1. Historical price trends
2. Volume patterns
3. Market momentum
4. Support/resistance levels
5. Price prediction for next 24h, 7d, 30d

Format as JSON with: trend_analysis, volume_pattern, momentum, support_resistance, predictions (24h, 7d, 30d), confidence_level`,

      trading_insights: `Provide trading insights for ${tokenSymbol}:
${JSON.stringify(marketData, null, 2)}

Include:
1. Entry/exit recommendations
2. Stop-loss suggestions
3. Risk/reward ratio
4. Trading strategy
5. Key levels to watch

Format as JSON with: entry_points, exit_points, stop_loss, risk_reward, strategy, key_levels`
    };

    const prompt = prompts[analysisType as keyof typeof prompts];

    // Call appropriate AI API
    if (aiModel === 'claude' && claudeKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: prompt
          }]
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      // Try to parse JSON from response
      try {
        analysisResult = JSON.parse(content);
      } catch {
        analysisResult = { analysis: content };
      }
    } else if (aiModel === 'gpt' && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a crypto market analysis expert. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        analysisResult = JSON.parse(content);
      } catch {
        analysisResult = { analysis: content };
      }
    } else if (aiModel === 'perplexity' && perplexityKey) {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'system', content: 'You are a crypto market analysis expert with real-time data access. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        analysisResult = JSON.parse(content);
      } catch {
        analysisResult = { analysis: content };
      }
    } else if (aiModel === 'grok' && grokKey) {
      console.log('Calling Grok API for market analysis');
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages: [
            { role: 'system', content: 'You are a crypto market analysis expert with real-time data access. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      console.log('Grok API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Grok API error:', errorText);
        throw new Error(`Grok API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        analysisResult = JSON.parse(content);
      } catch {
        analysisResult = { analysis: content };
      }
    } else {
      throw new Error('No valid AI API key configured');
    }

    // Extract sentiment score and predictions
    if (analysisType === 'market_overview' && analysisResult.sentiment) {
      const sentimentMap: Record<string, number> = { 
        bullish: 0.8, 
        neutral: 0.5, 
        bearish: 0.2 
      };
      sentimentScore = sentimentMap[analysisResult.sentiment.toLowerCase()] || 0.5;
    }

    if (analysisType === 'price_prediction' && analysisResult.predictions) {
      pricePrediction = analysisResult.predictions['24h'] || null;
      confidenceLevel = analysisResult.confidence_level || 'medium';
    }

    // Store analysis in database only if user is authenticated
    let savedAnalysis = null;
    if (user) {
      const { data, error: dbError } = await supabase
        .from('market_analysis')
        .insert({
          user_id: user.id,
          token_address: tokenAddress,
          token_symbol: tokenSymbol,
          analysis_type: analysisType,
          ai_model: aiModel,
          market_data: marketData,
          analysis_result: analysisResult,
          sentiment_score: sentimentScore,
          price_prediction: pricePrediction,
          confidence_level: confidenceLevel,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Don't throw - continue with analysis even if DB save fails
      } else {
        savedAnalysis = data;
      }
    }

    console.log(`Analysis completed for ${tokenSymbol}${user ? ' (saved to DB)' : ' (public access)'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: savedAnalysis || {
          token_address: tokenAddress,
          token_symbol: tokenSymbol,
          analysis_type: analysisType,
          ai_model: aiModel,
          analysis_result: analysisResult,
          sentiment_score: sentimentScore,
          price_prediction: pricePrediction,
          confidence_level: confidenceLevel,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in ai-market-analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});