import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface ApiRequest {
  endpoint: string;
  method: string;
  body?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Extract API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the API key to lookup
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Verify API key
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys' as any)
      .select('*')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (keyError || !apiKeyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if key is expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check (simple implementation)
    const { count: usageCount } = await supabase
      .from('api_usage_logs' as any)
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyData.id)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

    if (usageCount && usageCount >= apiKeyData.rate_limit) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { endpoint, method, body }: ApiRequest = await req.json();

    let response;
    let statusCode = 200;

    // Route to appropriate handler
    switch (endpoint) {
      case '/tokens':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('tokens')
            .select('*')
            .eq('user_id', apiKeyData.user_id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          response = { data };
        } else if (method === 'POST' && apiKeyData.permissions.includes('write')) {
          const { data, error } = await supabase
            .from('tokens')
            .insert({ ...body, user_id: apiKeyData.user_id })
            .select()
            .single();
          
          if (error) throw error;
          response = { data };
          statusCode = 201;
        } else {
          statusCode = 403;
          response = { error: 'Insufficient permissions' };
        }
        break;

      case '/airdrops':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('airdrops')
            .select('*')
            .eq('user_id', apiKeyData.user_id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          response = { data };
        } else {
          statusCode = 403;
          response = { error: 'Insufficient permissions' };
        }
        break;

      case '/transactions':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', apiKeyData.user_id)
            .order('created_at', { ascending: false })
            .limit(100);
          
          if (error) throw error;
          response = { data };
        } else {
          statusCode = 403;
          response = { error: 'Insufficient permissions' };
        }
        break;

      default:
        statusCode = 404;
        response = { error: 'Endpoint not found' };
    }

    // Update last used timestamp
    await supabase
      .from('api_keys' as any)
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    // Log API usage
    const responseTime = Date.now() - startTime;
    await supabase
      .from('api_usage_logs' as any)
      .insert({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: responseTime
      });

    return new Response(
      JSON.stringify(response),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-gateway:', error);
    
    // Log error
    const responseTime = Date.now() - startTime;
    const endpoint = req.url;
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
