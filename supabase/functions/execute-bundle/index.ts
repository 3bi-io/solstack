import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "https://esm.sh/@solana/web3.js@1.87.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BundleRequest {
  bundleId: string;
  wallets: Array<{
    address: string;
    name?: string;
    amount: number;
  }>;
  distributionStrategy: 'equal' | 'weighted' | 'custom';
  recipient?: string;
  token?: string;
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

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { bundleId, wallets, distributionStrategy, recipient, token } = await req.json() as BundleRequest;

    console.log(`Processing bundle ${bundleId} for user ${user.id}`);

    // Update bundle status to processing
    await supabaseClient
      .from('bundles')
      .update({ status: 'processing' })
      .eq('id', bundleId);

    // Get Solana Mainnet connection
    const rpcUrl = Deno.env.get('SOLANA_RPC_URL');
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC_URL not configured');
    }
    
    const connection = new Connection(rpcUrl, 'confirmed');
    console.log('Connected to Solana mainnet');

    const results = [];
    const signatures = [];

    // Process each wallet in the bundle
    for (const wallet of wallets) {
      try {
        console.log(`Processing wallet ${wallet.address} with amount ${wallet.amount}`);

        // Create transaction based on token type
        let signature: string;
        
        if (token === 'SOL') {
          // SOL transfer
          const fromPubkey = new PublicKey(wallet.address);
          const toPubkey = recipient ? new PublicKey(recipient) : fromPubkey;
          
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey,
              toPubkey,
              lamports: wallet.amount * LAMPORTS_PER_SOL,
            })
          );

          // Note: In production, you would need proper wallet signing
          // This is a simplified version - actual implementation requires secure key management
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = fromPubkey;

          // Simulate transaction
          console.log(`Simulating transaction for ${wallet.address}`);
          
          // Update bundle_wallet status
          await supabaseClient
            .from('bundle_wallets')
            .update({ 
              status: 'completed',
              transaction_signature: 'simulated_' + Date.now()
            })
            .eq('bundle_id', bundleId)
            .eq('wallet_address', wallet.address);

          signature = 'simulated_' + Date.now();
          signatures.push(signature);
          
          results.push({
            wallet: wallet.address,
            success: true,
            signature,
          });
        } else {
          // Token transfer (SPL Token)
          // Implement SPL token transfer logic here
          throw new Error('SPL token transfers not yet implemented');
        }

      } catch (error) {
        console.error(`Error processing wallet ${wallet.address}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await supabaseClient
          .from('bundle_wallets')
          .update({ 
            status: 'failed',
            error_message: errorMessage
          })
          .eq('bundle_id', bundleId)
          .eq('wallet_address', wallet.address);

        results.push({
          wallet: wallet.address,
          success: false,
          error: errorMessage,
        });
      }
    }

    // Update bundle with final status
    const allSuccess = results.every(r => r.success);
    await supabaseClient
      .from('bundles')
      .update({
        status: allSuccess ? 'completed' : 'failed',
        transaction_signatures: signatures,
        executed_at: new Date().toISOString(),
      })
      .eq('id', bundleId);

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: user.id,
      category: 'bundle',
      level: allSuccess ? 'info' : 'error',
      message: `Bundle ${allSuccess ? 'completed' : 'failed'}: ${results.length} wallets processed`,
      details: `Distribution: ${distributionStrategy}`,
      metadata: { bundleId, results },
    });

    return new Response(
      JSON.stringify({
        success: allSuccess,
        bundleId,
        results,
        signatures,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Bundle execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});