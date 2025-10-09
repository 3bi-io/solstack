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
  seedPhrase: string;
}

// Helper function to reconstruct wallet from seed phrase
async function getWalletFromSeedPhrase(seedPhrase: string): Promise<Keypair | null> {
  try {
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const airdropData: AirdropRequest = await req.json();
    console.log('Processing airdrop for', airdropData.addresses.length, 'addresses');

    if (!airdropData.seedPhrase) {
      return new Response(
        JSON.stringify({ error: 'Seed phrase is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's wallet from seed phrase
    const payer = await getWalletFromSeedPhrase(airdropData.seedPhrase);
    if (!payer) {
      return new Response(
        JSON.stringify({ error: 'Invalid seed phrase' }),
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

    // Create airdrop campaign (without user_id)
    const { data: airdrop, error: airdropError } = await supabaseClient
      .from('airdrops')
      .insert({
        user_id: null,
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

    // Calculate platform fee (0.00015 SOL of total airdrop)
    const totalAirdropAmount = BigInt(airdropData.amount) * BigInt(airdropData.addresses.length) * BigInt(10 ** 9);
    const platformFee = (totalAirdropAmount * BigInt(7)) / BigInt(100);

    // Transfer platform fee first
    const platformWalletAddress = Deno.env.get('PLATFORM_WALLET_ADDRESS');
    if (platformWalletAddress) {
      try {
        const platformPubkey = new PublicKey(platformWalletAddress);
        const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mintPubkey,
          platformPubkey
        );

        const platformTransferSignature = await transfer(
          connection,
          payer,
          senderTokenAccount.address,
          platformTokenAccount.address,
          payer.publicKey,
          platformFee
        );

        console.log('Platform fee transferred:', platformTransferSignature);
      } catch (platformError) {
        console.error('Failed to transfer platform fee:', platformError);
        // Continue even if platform fee transfer fails
      }
    }

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

    // Log transaction (without user_id)
    await supabaseClient.from('transactions').insert({
      user_id: null,
      type: 'airdrop',
      amount: airdropData.amount * airdropData.addresses.length,
      token: airdropData.tokenAddress.slice(0, 10),
      status: 'success',
      signature: airdrop.id.slice(0, 8),
      recipient: `${airdropData.addresses.length} addresses`,
      metadata: { airdrop_id: airdrop.id },
    });

    // Log activity (without user_id)
    await supabaseClient.from('activity_logs').insert({
      user_id: null,
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
