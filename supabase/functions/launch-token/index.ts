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
  userWalletAddress: string;
  userId?: string;
}

// Helper function to get platform wallet from secret
function getPlatformWallet(): Keypair | null {
  try {
    const platformKeypairJson = Deno.env.get('PLATFORM_WALLET_KEYPAIR');
    if (!platformKeypairJson) {
      console.error('PLATFORM_WALLET_KEYPAIR not configured');
      return null;
    }
    
    // Parse the secret key array from JSON
    const secretKeyArray = JSON.parse(platformKeypairJson);
    const secretKey = Uint8Array.from(secretKeyArray);
    
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Error loading platform wallet:', error);
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
    console.log('Launching token for user:', tokenData.userWalletAddress);

    // Validate input
    if (!tokenData.name || !tokenData.symbol || !tokenData.supply || !tokenData.userWalletAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user wallet address
    let userPubkey: PublicKey;
    try {
      userPubkey = new PublicKey(tokenData.userWalletAddress);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid wallet address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get platform wallet (pays for transactions)
    const payer = getPlatformWallet();
    if (!payer) {
      return new Response(
        JSON.stringify({ error: 'Platform wallet not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating token with platform wallet, minting to:', userPubkey.toString());

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

      // Create mint (SPL token) - Platform is initial mint authority
      const mint = await createMint(
        connection,
        payer, // Platform pays for creation
        payer.publicKey, // Platform is mint authority (can transfer later)
        payer.publicKey, // Platform is freeze authority (can transfer later)
        tokenData.decimals
      );

      mintAddress = mint.toString();
      console.log('Token mint created:', mintAddress);

      // Create associated token account for user
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer, // Platform pays for account creation
        mint,
        userPubkey // User owns the token account
      );

      console.log('Token account created:', tokenAccount.address.toString());

      // Calculate platform fee (7%)
      const userSupply = BigInt(tokenData.supply) * BigInt(10 ** tokenData.decimals);
      const platformFee = (userSupply * BigInt(7)) / BigInt(100);

      // Mint user's supply to user
      const mintTxSignature = await mintTo(
        connection,
        payer, // Platform pays and signs
        mint,
        tokenAccount.address,
        payer.publicKey, // Platform is mint authority
        userSupply
      );

      signature = mintTxSignature;
      console.log('Minted user supply. Signature:', signature);

      // Mint platform fee to platform wallet (before transferring authority)
      const platformWalletAddress = Deno.env.get('PLATFORM_WALLET_ADDRESS');
      if (platformWalletAddress && platformFee > 0n) {
        try {
          const platformPubkey = new PublicKey(platformWalletAddress);
          const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            platformPubkey
          );

          await mintTo(
            connection,
            payer,
            mint,
            platformTokenAccount.address,
            payer.publicKey, // Platform is still mint authority
            platformFee
          );

          console.log('Platform fee minted:', platformFee.toString());
        } catch (platformError) {
          console.error('Failed to mint platform fee:', platformError);
          // Continue even if platform fee minting fails
        }
      }

      // Transfer mint authority to user (gives user full control)
      try {
        const { setAuthority, AuthorityType } = await import('https://esm.sh/@solana/spl-token@0.3.9');
        
        await setAuthority(
          connection,
          payer,
          mint,
          payer.publicKey, // Current authority (platform)
          AuthorityType.MintTokens,
          userPubkey // New authority (user)
        );
        
        console.log('Mint authority transferred to user');
      } catch (authorityError) {
        console.error('Failed to transfer mint authority:', authorityError);
        // Continue even if authority transfer fails
      }

    } catch (solanaError) {
      console.error('Solana blockchain error:', solanaError);
      throw new Error(`Blockchain error: ${solanaError instanceof Error ? solanaError.message : 'Unknown error'}`);
    }

    // Create token record in database
    const { data: token, error: insertError } = await supabaseClient
      .from('tokens')
      .insert({
        user_id: tokenData.userId || null,
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
      user_id: tokenData.userId || null,
      type: 'token_launch',
      amount: tokenData.supply,
      token: tokenData.symbol,
      status: 'success',
      signature: signature,
      metadata: { token_id: token.id, mint_address: mintAddress, user_wallet: tokenData.userWalletAddress },
    });

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: tokenData.userId || null,
      level: 'success',
      message: `Token ${tokenData.name} (${tokenData.symbol}) launched successfully`,
      category: 'token',
      details: `Initial supply: ${tokenData.supply.toLocaleString()} ${tokenData.symbol}. Mint: ${mintAddress}. Owner: ${tokenData.userWalletAddress}`,
      metadata: { token_id: token.id, mint_address: mintAddress, signature, user_wallet: tokenData.userWalletAddress },
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
