import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenRequest {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description?: string;
  logoUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData: TokenRequest = await req.json();
    console.log('Launching token:', tokenData);

    // Validate input
    if (!tokenData.name || !tokenData.symbol || !tokenData.supply) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In production, this would interact with Solana blockchain
    // For now, we'll simulate the token creation
    const mockMintAddress = `${Array.from({ length: 44 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[Math.floor(Math.random() * 58)]
    ).join('')}`;

    // Create token record in database
    const { data: token, error: insertError } = await supabaseClient
      .from('tokens')
      .insert({
        user_id: user.id,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        supply: tokenData.supply,
        description: tokenData.description,
        logo_url: tokenData.logoUrl,
        mint_address: mockMintAddress,
        status: 'success',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    // Log transaction
    await supabaseClient.from('transactions').insert({
      user_id: user.id,
      type: 'token_launch',
      amount: tokenData.supply,
      token: tokenData.symbol,
      status: 'success',
      signature: mockMintAddress.slice(0, 8),
      metadata: { token_id: token.id },
    });

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: user.id,
      level: 'success',
      message: `Token ${tokenData.name} (${tokenData.symbol}) launched successfully`,
      category: 'token',
      details: `Initial supply: ${tokenData.supply.toLocaleString()} ${tokenData.symbol}`,
      metadata: { token_id: token.id, mint_address: mockMintAddress },
    });

    console.log('Token created successfully:', token);

    return new Response(
      JSON.stringify({ 
        success: true, 
        token,
        message: 'Token launched successfully on Solana' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in launch-token function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
