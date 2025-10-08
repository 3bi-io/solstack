import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "https://esm.sh/@solana/web3.js@1.87.6";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "https://esm.sh/@solana/spl-token@0.3.9";

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

    // Reconstruct seed phrase
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

    // In production, use bip39 to derive keypair from seed phrase
    // For now, we'll create a deterministic keypair from the seed
    const encoder = new TextEncoder();
    const seedBytes = encoder.encode(seedPhrase);
    
    // Hash the seed to get 32 bytes for keypair
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

    // Get user's wallet from seed phrase
    const payer = await getWalletFromSeedPhrase(user.id, supabaseClient);
    if (!payer) {
      return new Response(
        JSON.stringify({ error: 'No wallet connected. Please connect your wallet first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating token on Solana with wallet:', payer.publicKey.toString());

    // Connect to Solana (using devnet for testing)
    const connection = new Connection(
      Deno.env.get('SOLANA_RPC_URL') || 'https://api.devnet.solana.com',
      'confirmed'
    );

    let mintAddress: string;
    let signature: string;

    try {
      // Check balance
      const balance = await connection.getBalance(payer.publicKey);
      console.log('Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');

      if (balance < 0.01 * LAMPORTS_PER_SOL) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient SOL balance. Need at least 0.01 SOL for token creation.',
            balance: balance / LAMPORTS_PER_SOL 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create mint (SPL token)
      const mint = await createMint(
        connection,
        payer,
        payer.publicKey, // mint authority
        payer.publicKey, // freeze authority
        tokenData.decimals
      );

      mintAddress = mint.toString();
      console.log('Token mint created:', mintAddress);

      // Create associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
      );

      console.log('Token account created:', tokenAccount.address.toString());

      // Mint initial supply
      const mintTxSignature = await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer.publicKey,
        BigInt(tokenData.supply) * BigInt(10 ** tokenData.decimals)
      );

      signature = mintTxSignature;
      console.log('Minted initial supply. Signature:', signature);

    } catch (solanaError) {
      console.error('Solana blockchain error:', solanaError);
      throw new Error(`Blockchain error: ${solanaError instanceof Error ? solanaError.message : 'Unknown error'}`);
    }

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
        mint_address: mintAddress,
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
      signature: signature,
      metadata: { token_id: token.id, mint_address: mintAddress },
    });

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: user.id,
      level: 'success',
      message: `Token ${tokenData.name} (${tokenData.symbol}) launched successfully`,
      category: 'token',
      details: `Initial supply: ${tokenData.supply.toLocaleString()} ${tokenData.symbol}. Mint: ${mintAddress}`,
      metadata: { token_id: token.id, mint_address: mintAddress, signature },
    });

    console.log('Token created successfully:', token);

    return new Response(
      JSON.stringify({ 
        success: true, 
        token,
        mintAddress,
        signature,
        explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
        message: 'Token launched successfully on Solana blockchain' 
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
