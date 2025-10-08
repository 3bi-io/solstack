import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReferralRequest {
  referralCode: string;
  newUserId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { referralCode, newUserId }: ReferralRequest = await req.json();

    console.log('Processing referral:', { referralCode, newUserId });

    // Find the referral code
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes' as any)
      .select('*')
      .eq('code', referralCode)
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      return new Response(
        JSON.stringify({ error: 'Invalid referral code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Referral code expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max uses
    if (codeData.max_uses && codeData.uses_count >= codeData.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Referral code usage limit reached' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already referred
    const { data: existingReferral } = await supabase
      .from('referrals' as any)
      .select('*')
      .eq('referred_id', newUserId)
      .single();

    if (existingReferral) {
      return new Response(
        JSON.stringify({ error: 'User already referred' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate reward
    let rewardAmount = 0;
    if (codeData.reward_type === 'percentage') {
      rewardAmount = codeData.reward_value; // Percentage discount
    } else if (codeData.reward_type === 'fixed') {
      rewardAmount = codeData.reward_value; // Fixed amount
    }

    // Create referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals' as any)
      .insert({
        referrer_id: codeData.user_id,
        referred_id: newUserId,
        referral_code_id: codeData.id,
        reward_amount: rewardAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (referralError) throw referralError;

    // Increment uses count
    await supabase
      .from('referral_codes' as any)
      .update({
        uses_count: codeData.uses_count + 1
      })
      .eq('id', codeData.id);

    // Log the event
    await supabase.from('activity_logs').insert({
      user_id: codeData.user_id,
      category: 'referral',
      level: 'info',
      message: `New referral tracked from code ${referralCode}`,
      details: `Referred user: ${newUserId}`,
      metadata: { referral_id: referral.id, code: referralCode }
    });

    return new Response(
      JSON.stringify({
        success: true,
        referral,
        reward: {
          type: codeData.reward_type,
          amount: rewardAmount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-referral:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
