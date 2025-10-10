import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  Connection, 
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL
} from "https://esm.sh/@solana/web3.js@1.87.6";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "https://esm.sh/@solana/spl-token@0.3.9";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const airdropRequestSchema = z.object({
  tokenAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address'),
  amount: z.number().positive().max(1e15, 'Amount too large'),
  addresses: z.array(z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)).min(1).max(1000, 'Max 1000 addresses'),
  signedTransactions: z.array(z.string()).optional(),
});

type AirdropRequest = z.infer<typeof airdropRequestSchema>;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawData = await req.json();
    const validationResult = airdropRequestSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.format() 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const airdropData = validationResult.data;
    console.log('Processing airdrop for', airdropData.addresses.length, 'addresses');

    // Connect to Solana
    const connection = new Connection(
      Deno.env.get('SOLANA_RPC_URL') || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Validate token mint address
    let mintPubkey: PublicKey;
    try {
      mintPubkey = new PublicKey(airdropData.tokenAddress);
      // Verify token mint exists
      await connection.getAccountInfo(mintPubkey);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid or non-existent token address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create airdrop campaign
    const { data: airdrop, error: airdropError } = await supabaseClient
      .from('airdrops')
      .insert({
        user_id: user.id,
        token_address: airdropData.tokenAddress,
        amount_per_address: airdropData.amount,
        total_recipients: airdropData.addresses.length,
        total_amount: airdropData.amount * airdropData.addresses.length,
        status: 'processing',
      })
      .select()
      .single();

    if (airdropError) {
      console.error('Failed to create airdrop:', airdropError);
      throw airdropError;
    }

    console.log('Airdrop campaign created:', airdrop.id);

    // Process recipients - this now expects pre-signed transactions from client
    // The wallet adapter on the client side will handle all signing
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const address of airdropData.addresses) {
      // Validate each recipient address
      try {
        new PublicKey(address);
      } catch (error) {
        console.error(`Invalid recipient address: ${address}`);
        failedCount++;
        
        await supabaseClient.from('airdrop_recipients').insert({
          airdrop_id: airdrop.id,
          recipient_address: address,
          amount: airdropData.amount,
          status: 'failed',
          error_message: 'Invalid address format',
        });
        
        results.push({
          address,
          status: 'failed',
          error: 'Invalid address',
        });
        continue;
      }

      // Store recipient record (actual transfer will be done client-side with wallet adapter)
      await supabaseClient.from('airdrop_recipients').insert({
        airdrop_id: airdrop.id,
        recipient_address: address,
        amount: airdropData.amount,
        status: 'pending',
      });

      results.push({
        address,
        status: 'pending',
        message: 'Ready for client-side signing',
      });
    }

    // Update airdrop status
    await supabaseClient
      .from('airdrops')
      .update({
        status: 'pending',
        completed_count: 0,
        failed_count: failedCount,
      })
      .eq('id', airdrop.id);

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: user.id,
      level: 'info',
      message: `Airdrop created for ${airdropData.addresses.length} addresses`,
      category: 'airdrop',
      details: `Token: ${airdropData.tokenAddress}. Awaiting wallet signatures.`,
      metadata: { airdrop_id: airdrop.id },
    });

    console.log('Airdrop prepared:', { airdrop_id: airdrop.id });

    return new Response(
      JSON.stringify({ 
        success: true,
        airdrop_id: airdrop.id,
        message: 'Airdrop prepared. Use wallet adapter to sign and submit transactions client-side.',
        recipients: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-airdrop function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});