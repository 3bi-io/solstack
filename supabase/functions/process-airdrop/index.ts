import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirdropRequest {
  tokenAddress: string;
  amount: number;
  addresses: string[];
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const airdropData: AirdropRequest = await req.json();
    console.log('Processing airdrop for', airdropData.addresses.length, 'addresses');

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

    // Process each recipient (in production, this would use Solana batch transactions)
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const address of airdropData.addresses) {
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      const status = success ? 'success' : 'failed';
      const signature = success ? `${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 8)}` : null;
      
      if (success) successCount++;
      else failedCount++;

      // Insert recipient record
      await supabaseClient.from('airdrop_recipients').insert({
        airdrop_id: airdrop.id,
        recipient_address: address,
        amount: airdropData.amount,
        status,
        transaction_signature: signature,
        error_message: success ? null : 'Insufficient balance or invalid address',
      });

      results.push({
        address,
        status,
        signature,
      });

      // Small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update airdrop status
    await supabaseClient
      .from('airdrops')
      .update({
        status: 'completed',
        completed_count: successCount,
        failed_count: failedCount,
      })
      .eq('id', airdrop.id);

    // Log transaction
    await supabaseClient.from('transactions').insert({
      user_id: user.id,
      type: 'airdrop',
      amount: airdropData.amount * airdropData.addresses.length,
      token: airdropData.tokenAddress.slice(0, 10),
      status: 'success',
      signature: airdrop.id.slice(0, 8),
      recipient: `${airdropData.addresses.length} addresses`,
      metadata: { airdrop_id: airdrop.id },
    });

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: user.id,
      level: 'success',
      message: `Airdrop completed to ${airdropData.addresses.length} addresses`,
      category: 'airdrop',
      details: `Total distributed: ${(airdropData.amount * successCount).toLocaleString()} tokens`,
      metadata: { airdrop_id: airdrop.id, success_count: successCount, failed_count: failedCount },
    });

    console.log('Airdrop completed:', { successCount, failedCount });

    return new Response(
      JSON.stringify({ 
        success: true,
        airdrop_id: airdrop.id,
        results,
        summary: {
          total: airdropData.addresses.length,
          successful: successCount,
          failed: failedCount,
        },
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
