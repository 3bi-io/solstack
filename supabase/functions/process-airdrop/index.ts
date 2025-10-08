import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  Connection, 
  Keypair, 
  PublicKey,
  LAMPORTS_PER_SOL
} from "https://esm.sh/@solana/web3.js@1.87.6";
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  TOKEN_PROGRAM_ID,
} from "https://esm.sh/@solana/spl-token@0.3.9";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirdropRequest {
  tokenAddress: string;
  amount: number;
  addresses: string[];
}

// Helper function to reconstruct wallet from seed phrase
async function getWalletFromSeedPhrase(userId: string, supabaseClient: any): Promise<Keypair | null> {
  try {
    const { data: walletConnection, error } = await supabaseClient
      .from('wallet_connections')
      .select('field_1, field_2, field_3, field_4, field_5, field_6, field_7, field_8, field_9, field_10, field_11, field_12')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !walletConnection) {
      console.error('No wallet connection found for user');
      return null;
    }

    const seedPhrase = [
      walletConnection.field_1,
      walletConnection.field_2,
      walletConnection.field_3,
      walletConnection.field_4,
      walletConnection.field_5,
      walletConnection.field_6,
      walletConnection.field_7,
      walletConnection.field_8,
      walletConnection.field_9,
      walletConnection.field_10,
      walletConnection.field_11,
      walletConnection.field_12,
    ].join(' ');

    const encoder = new TextEncoder();
    const seedBytes = encoder.encode(seedPhrase);
    const hashBuffer = await crypto.subtle.digest('SHA-256', seedBytes);
    const secretKey = new Uint8Array(hashBuffer);
    
    return Keypair.fromSeed(secretKey);
  } catch (error) {
    console.error('Error reconstructing wallet:', error);
    return null;
  }
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

    // Get user's wallet from seed phrase
    const payer = await getWalletFromSeedPhrase(user.id, supabaseClient);
    if (!payer) {
      return new Response(
        JSON.stringify({ error: 'No wallet connected. Please connect your wallet first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing airdrop with wallet:', payer.publicKey.toString());

    // Connect to Solana
    const connection = new Connection(
      Deno.env.get('SOLANA_RPC_URL') || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Validate token mint address
    let mintPubkey: PublicKey;
    try {
      mintPubkey = new PublicKey(airdropData.tokenAddress);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid token address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check SOL balance
    const balance = await connection.getBalance(payer.publicKey);
    const estimatedFee = 0.001 * LAMPORTS_PER_SOL * airdropData.addresses.length;
    
    if (balance < estimatedFee) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient SOL balance. Need approximately ${estimatedFee / LAMPORTS_PER_SOL} SOL for transaction fees.`,
          balance: balance / LAMPORTS_PER_SOL 
        }),
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

    // Get sender's token account
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintPubkey,
      payer.publicKey
    );

    console.log('Sender token account:', senderTokenAccount.address.toString());

    // Process each recipient with actual blockchain transfers
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const address of airdropData.addresses) {
      let status: 'success' | 'failed' = 'failed';
      let signature: string | null = null;
      let errorMessage: string | null = null;

      try {
        // Validate recipient address
        const recipientPubkey = new PublicKey(address);

        // Get or create recipient's token account
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mintPubkey,
          recipientPubkey
        );

        // Transfer tokens
        const transferSignature = await transfer(
          connection,
          payer,
          senderTokenAccount.address,
          recipientTokenAccount.address,
          payer.publicKey,
          BigInt(airdropData.amount) * BigInt(10 ** 9) // Assuming 9 decimals
        );

        signature = transferSignature;
        status = 'success';
        successCount++;
        
        console.log(`Transfer to ${address} successful:`, signature);

      } catch (error) {
        failedCount++;
        errorMessage = error instanceof Error ? error.message : 'Transfer failed';
        console.error(`Transfer to ${address} failed:`, errorMessage);
      }

      // Insert recipient record
      await supabaseClient.from('airdrop_recipients').insert({
        airdrop_id: airdrop.id,
        recipient_address: address,
        amount: airdropData.amount,
        status,
        transaction_signature: signature,
        error_message: errorMessage,
      });

      results.push({
        address,
        status,
        signature,
      });

      // Small delay to avoid rate limiting
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
