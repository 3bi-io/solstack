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
  seedPhrase: string;
}

// Helper function to reconstruct wallet from seed phrase
async function getWalletFromSeedPhrase(seedPhrase: string): Promise<Keypair | null> {
  try {
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const tokenData: TokenRequest = await req.json();
    console.log('Launching token:', tokenData);

    // Validate input
    if (!tokenData.name || !tokenData.symbol || !tokenData.supply || !tokenData.seedPhrase) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's wallet from seed phrase
    const payer = await getWalletFromSeedPhrase(tokenData.seedPhrase);
    if (!payer) {
      return new Response(
        JSON.stringify({ error: 'Invalid seed phrase' }),
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

      // Create associated token account for user
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
      );

      console.log('Token account created:', tokenAccount.address.toString());

      // Calculate platform fee (7%)
      const totalSupplyWithFee = BigInt(tokenData.supply) * BigInt(10 ** tokenData.decimals);
      const platformFee = (totalSupplyWithFee * BigInt(7)) / BigInt(100);
      const userSupply = totalSupplyWithFee + platformFee; // User gets their supply, platform gets 7% on top

      // Mint initial supply + platform fee to user
      const mintTxSignature = await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer.publicKey,
        userSupply
      );

      signature = mintTxSignature;
      console.log('Minted initial supply with platform fee. Signature:', signature);

      // Transfer platform fee to platform wallet
      const platformWalletAddress = Deno.env.get('PLATFORM_WALLET_ADDRESS');
      if (platformWalletAddress) {
        try {
          const platformPubkey = new PublicKey(platformWalletAddress);
          const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            platformPubkey
          );

          // Transfer 7% to platform
          const { transfer } = await import('https://esm.sh/@solana/spl-token@0.3.9');
          const transferSignature = await transfer(
            connection,
            payer,
            tokenAccount.address,
            platformTokenAccount.address,
            payer.publicKey,
            platformFee
          );

          console.log('Platform fee transferred:', transferSignature);
        } catch (platformError) {
          console.error('Failed to transfer platform fee:', platformError);
          // Continue even if platform fee transfer fails
        }
      }

    } catch (solanaError) {
      console.error('Solana blockchain error:', solanaError);
      throw new Error(`Blockchain error: ${solanaError instanceof Error ? solanaError.message : 'Unknown error'}`);
    }

    // Create token record in database (without user_id)
    const { data: token, error: insertError } = await supabaseClient
      .from('tokens')
      .insert({
        user_id: null,
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

    // Log transaction (without user_id)
    await supabaseClient.from('transactions').insert({
      user_id: null,
      type: 'token_launch',
      amount: tokenData.supply,
      token: tokenData.symbol,
      status: 'success',
      signature: signature,
      metadata: { token_id: token.id, mint_address: mintAddress },
    });

    // Log activity (without user_id)
    await supabaseClient.from('activity_logs').insert({
      user_id: null,
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
