import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuraSession {
  alias: string;
  wallet: string;
  action: string;
  timestamp: number;
  intensity: number;
  hash: string;
  embedding?: number[];
}

// Simple hash function
function computeHash(data: any): string {
  const encoder = new TextEncoder();
  const dataStr = JSON.stringify(data);
  const hashBuffer = encoder.encode(dataStr);
  return Array.from(hashBuffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 64);
}

// Temporal decay scorer
function calculateTemporalScore(timestamp: number, decayTau: number = 3600): number {
  const age = Date.now() - timestamp;
  return Math.exp(-age / (decayTau * 1000));
}

// Generate aura glow description
function generateAuraGlow(wallet: string, intensity: number): string {
  const glowTypes = ['pulsing pink', 'shimmering violet', 'radiant magenta', 'glowing rose'];
  const glowType = glowTypes[Math.floor(Math.random() * glowTypes.length)];
  return `Aura glow activated for ${wallet.slice(0, 8)}...${wallet.slice(-6)} at ${intensity.toFixed(1)}x intensity. ${glowType} with temporal decay applied.`;
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
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, wallet, intensity = 1.0, alias, query } = await req.json();

    console.log('Aura-TIMP request:', { action, wallet, intensity, user: user.id });

    // Handle different actions
    switch (action) {
      case 'flash': {
        // Create aura flash session
        const sessionData: AuraSession = {
          alias: alias || `aura_${wallet}_${Date.now()}`,
          wallet,
          action: 'aura_flash',
          timestamp: Date.now(),
          intensity,
          hash: '',
        };

        sessionData.hash = computeHash(sessionData);

        // Store in activity_logs (reusing existing table)
        const { error: logError } = await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            category: 'aura',
            level: 'info',
            message: `Aura flash at ${intensity}x intensity`,
            details: JSON.stringify(sessionData),
            metadata: {
              wallet,
              intensity,
              hash: sessionData.hash,
            },
          });

        if (logError) throw logError;

        // Search for similar past sessions (last 10 aura events)
        const { data: similarSessions } = await supabaseClient
          .from('activity_logs')
          .select('created_at, metadata, details')
          .eq('user_id', user.id)
          .eq('category', 'aura')
          .order('created_at', { ascending: false })
          .limit(10);

        const similar = (similarSessions || [])
          .map((s: any) => ({
            timestamp: new Date(s.created_at).getTime(),
            score: calculateTemporalScore(new Date(s.created_at).getTime()),
            wallet: s.metadata?.wallet,
          }))
          .filter(s => s.score > 0.1)
          .slice(0, 3);

        return new Response(
          JSON.stringify({
            status: 'activated',
            glow: generateAuraGlow(wallet, intensity),
            session: sessionData,
            similar_sessions: similar,
            message: 'Aura pulsed. Check your screen.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'search': {
        // Search for sessions based on query
        const { data: sessions } = await supabaseClient
          .from('activity_logs')
          .select('created_at, metadata, details, message')
          .eq('user_id', user.id)
          .eq('category', 'aura')
          .order('created_at', { ascending: false })
          .limit(50);

        const results = (sessions || [])
          .filter((s: any) => {
            const searchText = `${s.message} ${JSON.stringify(s.metadata)}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
          })
          .map((s: any) => ({
            timestamp: new Date(s.created_at).getTime(),
            score: calculateTemporalScore(new Date(s.created_at).getTime()),
            wallet: s.metadata?.wallet,
            message: s.message,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        return new Response(
          JSON.stringify({
            results,
            count: results.length,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'history': {
        // Get user's aura history
        const { data: history } = await supabaseClient
          .from('activity_logs')
          .select('created_at, metadata, message')
          .eq('user_id', user.id)
          .eq('category', 'aura')
          .order('created_at', { ascending: false })
          .limit(20);

        return new Response(
          JSON.stringify({
            history: (history || []).map((h: any) => ({
              timestamp: new Date(h.created_at).getTime(),
              wallet: h.metadata?.wallet,
              intensity: h.metadata?.intensity,
              message: h.message,
            })),
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Aura-TIMP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
