import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1).max(10000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
});

// Rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 20;

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  userLimit.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - userLimit.count };
}

// Function to detect Solana token address (44 character base58 string)
const isSolanaAddress = (text: string): boolean => {
  const addressRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
  return addressRegex.test(text);
};

// Function to fetch token data from DexScreener
const fetchTokenData = async (tokenAddress: string) => {
  try {
    console.log('Fetching token data for:', tokenAddress);
    
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }
    
    // Get the most liquid pair
    const mainPair = data.pairs.sort((a: any, b: any) => 
      (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    )[0];
    
    return {
      name: mainPair.baseToken?.name || 'Unknown',
      symbol: mainPair.baseToken?.symbol || 'Unknown',
      address: tokenAddress,
      priceUsd: mainPair.priceUsd || '0',
      priceChange24h: mainPair.priceChange?.h24 || 0,
      volume24h: mainPair.volume?.h24 || 0,
      liquidity: mainPair.liquidity?.usd || 0,
      fdv: mainPair.fdv || 0,
      marketCap: mainPair.marketCap || 0,
      dexId: mainPair.dexId || 'Unknown',
      pairAddress: mainPair.pairAddress || 'Unknown',
      txns24h: {
        buys: mainPair.txns?.h24?.buys || 0,
        sells: mainPair.txns?.h24?.sells || 0
      },
      info: mainPair.info || {}
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    return null;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Max 20 requests per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawData = await req.json();
    const validationResult = chatRequestSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.format() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = validationResult.data;
    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    // Check if the latest message contains a Solana token address
    const lastMessage = messages[messages.length - 1];
    let enrichedMessages = [...messages];
    
    if (lastMessage && lastMessage.role === 'user' && isSolanaAddress(lastMessage.content)) {
      // Extract potential token addresses from the message
      const addressMatch = lastMessage.content.match(/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/);
      
      if (addressMatch) {
        const tokenAddress = addressMatch[0];
        const tokenData = await fetchTokenData(tokenAddress);
        
        if (tokenData) {
          console.log('Token data fetched successfully:', tokenData.symbol);
          
          // Add context about the token to the conversation
          const contextMessage: z.infer<typeof chatMessageSchema> = {
            role: 'system' as const,
            content: `The user just pasted a Solana token address. Here's the live data I fetched:

🪙 Token: ${tokenData.name} (${tokenData.symbol})
📍 Address: ${tokenData.address}
💰 Current Price: $${parseFloat(tokenData.priceUsd).toFixed(8)}
📊 24h Change: ${tokenData.priceChange24h > 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%
📈 24h Volume: $${tokenData.volume24h.toLocaleString()}
💧 Liquidity: $${tokenData.liquidity.toLocaleString()}
🏦 Market Cap: $${tokenData.marketCap.toLocaleString()}
💎 FDV: $${tokenData.fdv.toLocaleString()}
🔄 DEX: ${tokenData.dexId}
📝 24h Transactions: ${tokenData.txns24h.buys} buys, ${tokenData.txns24h.sells} sells

Provide a comprehensive analysis of this token based on these metrics. Include:
1. Price action and trend analysis
2. Liquidity and volume assessment (is it healthy?)
3. Market sentiment based on buy/sell ratio
4. Risk factors to consider (liquidity, volatility, etc.)
5. Any notable observations or red flags

Be direct and start your response immediately with the analysis.`
          };
          
          enrichedMessages = [contextMessage, ...messages];
        }
      }
    }

    const systemPrompt = {
      role: 'system',
      content: `You are an expert cryptocurrency analyst and Solana blockchain specialist powered by xAI's Grok. You have deep knowledge about:
- Blockchain technology and consensus mechanisms
- Major cryptocurrencies (Bitcoin, Ethereum, Solana, etc.)
- DeFi protocols and smart contracts
- Token economics and tokenomics
- Market analysis and trading strategies
- NFTs and Web3 technologies
- Cryptocurrency regulations and compliance
- Security best practices for crypto assets

**SPECIAL CAPABILITY**: When a user pastes a Solana token address (a 32-44 character base58 string), you automatically recognize it and receive live market data. You then provide detailed metrics and analysis about that token.

**IMPORTANT - PROACTIVE SUGGESTIONS**: 
When users ask questions like:
- "What do you think about [token name]?"
- "Should I buy [token]?"
- "Analyze [token]"
- "Is [token] a good investment?"
- "Tell me about [token]"
- Or any question about a specific token's performance, price, or metrics

You MUST respond by saying something like:
"I'd be happy to analyze that token for you! Please paste the Solana token address (it looks like a long string of characters, about 32-44 characters) and I'll fetch the latest market data including price, volume, liquidity, and transaction metrics to give you a detailed analysis."

This way, users know they can get real-time data by simply pasting the token's contract address.

When analyzing tokens with live data, focus on:
- Price trends and momentum indicators
- Liquidity depth and health
- Trading volume patterns and velocity
- Buy/sell pressure and market sentiment
- Risk factors (low liquidity, high volatility, potential rugpulls)
- Market cap and FDV analysis

Always cite specific data points when making claims. Be honest about risks and limitations. Provide actionable insights. Be conversational but professional.`
    };

    console.log('Calling Grok API with messages:', messages.length);
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [systemPrompt, ...enrichedMessages],
        temperature: 0.7,
        max_tokens: 1500,
        stream: false,
      }),
    });

    console.log('Grok API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API error:', errorData);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Grok API response data:', JSON.stringify(data));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from Grok API');
    }
    
    const assistantMessage = data.choices[0].message.content;
    console.log('Sending response, message length:', assistantMessage?.length);

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in grok-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
