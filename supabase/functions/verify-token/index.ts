import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationCheck {
  type: string;
  result: 'pass' | 'fail' | 'warning';
  message: string;
  data?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { tokenId, mintAddress } = await req.json();

    console.log('Verifying token:', { tokenId, mintAddress });

    const checks: VerificationCheck[] = [];
    let scamScore = 0;
    let verificationLevel = 'unverified';

    // Check 1: Metadata validation
    const { data: token } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (!token) {
      throw new Error('Token not found');
    }

    // Check metadata completeness
    const hasName = token.name && token.name.length > 0;
    const hasSymbol = token.symbol && token.symbol.length > 0;
    const hasDescription = token.description && token.description.length > 0;
    const hasLogo = token.logo_url && token.logo_url.length > 0;

    if (hasName && hasSymbol && hasDescription && hasLogo) {
      checks.push({
        type: 'metadata_complete',
        result: 'pass',
        message: 'Token has complete metadata'
      });
    } else {
      checks.push({
        type: 'metadata_complete',
        result: 'warning',
        message: 'Token metadata is incomplete'
      });
      scamScore += 10;
    }

    // Check 2: Social links validation
    const hasSocials = token.website || token.twitter || token.telegram || token.discord;
    if (hasSocials) {
      checks.push({
        type: 'social_links',
        result: 'pass',
        message: 'Token has social links'
      });
    } else {
      checks.push({
        type: 'social_links',
        result: 'warning',
        message: 'No social links provided'
      });
      scamScore += 15;
    }

    // Check 3: Authority settings
    if (token.revoke_mint_authority) {
      checks.push({
        type: 'mint_authority',
        result: 'pass',
        message: 'Mint authority will be revoked (good for security)'
      });
    } else {
      checks.push({
        type: 'mint_authority',
        result: 'warning',
        message: 'Mint authority will not be revoked (tokens can be minted indefinitely)'
      });
      scamScore += 20;
    }

    if (token.revoke_freeze_authority) {
      checks.push({
        type: 'freeze_authority',
        result: 'pass',
        message: 'Freeze authority will be revoked (good for decentralization)'
      });
    } else {
      checks.push({
        type: 'freeze_authority',
        result: 'warning',
        message: 'Freeze authority will not be revoked (creator can freeze accounts)'
      });
      scamScore += 20;
    }

    // Check 4: Token name/symbol suspicious patterns
    const suspiciousPatterns = [
      /free/i,
      /airdrop/i,
      /giveaway/i,
      /elon/i,
      /musk/i,
      /official/i,
      /binance/i,
      /coinbase/i
    ];

    const hasSuspiciousName = suspiciousPatterns.some(pattern => 
      pattern.test(token.name) || pattern.test(token.symbol)
    );

    if (hasSuspiciousName) {
      checks.push({
        type: 'suspicious_name',
        result: 'fail',
        message: 'Token name/symbol contains suspicious keywords'
      });
      scamScore += 40;
    } else {
      checks.push({
        type: 'suspicious_name',
        result: 'pass',
        message: 'Token name/symbol looks legitimate'
      });
    }

    // Check 5: Supply validation
    const supply = parseInt(token.supply);
    if (supply > 0 && supply < 1000000000000) { // Reasonable supply
      checks.push({
        type: 'supply_check',
        result: 'pass',
        message: 'Token supply is within reasonable range'
      });
    } else {
      checks.push({
        type: 'supply_check',
        result: 'warning',
        message: 'Token supply is extremely high or low'
      });
      scamScore += 10;
    }

    // Determine verification level
    if (scamScore === 0) {
      verificationLevel = 'verified';
    } else if (scamScore <= 20) {
      verificationLevel = 'trusted';
    } else if (scamScore <= 50) {
      verificationLevel = 'unverified';
    } else {
      verificationLevel = 'suspicious';
    }

    // Update token with verification results
    await supabase
      .from('tokens')
      .update({
        verification_level: verificationLevel,
        scam_score: scamScore,
        is_verified: scamScore === 0
      })
      .eq('id', tokenId);

    // Store detailed verification checks
    for (const check of checks) {
      await supabase.from('token_verifications').insert({
        token_id: tokenId,
        check_type: check.type,
        check_result: check.result,
        check_data: check.data || {}
      });
    }

    // Log verification event
    await supabase.from('activity_logs').insert({
      user_id: token.user_id,
      category: 'token',
      level: scamScore > 50 ? 'warning' : 'info',
      message: `Token verified with ${verificationLevel} status`,
      details: `Scam score: ${scamScore}`,
      metadata: { token_id: tokenId, scam_score: scamScore }
    });

    return new Response(
      JSON.stringify({
        success: true,
        verificationLevel,
        scamScore,
        checks
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-token:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
