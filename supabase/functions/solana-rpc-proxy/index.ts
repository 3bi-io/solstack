import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for read-only RPC responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 10000; // 10 seconds for most cached data
const LONG_CACHE_TTL_MS = 60000; // 1 minute for rarely-changing data

// Rate limiting: track requests per IP
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

// Methods that are safe to cache
const CACHEABLE_METHODS = [
  'getVersion',
  'getHealth',
  'getSlot',
  'getBlockHeight',
  'getLatestBlockhash',
  'getMinimumBalanceForRentExemption',
  'getRecentPrioritizationFees',
];

// Methods with longer cache TTL
const LONG_CACHE_METHODS = [
  'getVersion',
  'getHealth',
  'getMinimumBalanceForRentExemption',
];

// Methods that should never be proxied (write operations need direct auth)
const BLOCKED_METHODS = [
  'sendTransaction',
  'simulateTransaction',
];

function getCacheKey(method: string, params: unknown[]): string {
  return `${method}:${JSON.stringify(params)}`;
}

function getFromCache(key: string): unknown | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.timestamp) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache(key: string, data: unknown, isLongCache: boolean): void {
  const ttl = isLongCache ? LONG_CACHE_TTL_MS : CACHE_TTL_MS;
  cache.set(key, { data, timestamp: Date.now() + ttl });
  
  // Cleanup old entries if cache gets too large
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now > v.timestamp) {
        cache.delete(k);
      }
    }
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: limit.resetAt - now };
  }
  
  limit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - limit.count, resetIn: limit.resetAt - now };
}

function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [ip, limit] of rateLimits.entries()) {
    if (now > limit.resetAt) {
      rateLimits.delete(ip);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Cleanup stale rate limit entries periodically
  if (Math.random() < 0.01) {
    cleanupRateLimits();
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          jsonrpc: '2.0', 
          error: { code: 429, message: 'Rate limit exceeded. Please try again later.' },
          id: null 
        }),
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
          }
        }
      );
    }

    // Parse RPC request
    const body = await req.json();
    const { method, params = [], id, jsonrpc } = body;

    if (!method) {
      return new Response(
        JSON.stringify({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid request: missing method' }, id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Block write operations through proxy
    if (BLOCKED_METHODS.includes(method)) {
      console.warn(`Blocked method attempted: ${method} from ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          jsonrpc: '2.0', 
          error: { code: -32601, message: 'This method is not available through the proxy' }, 
          id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache for cacheable methods
    const isCacheable = CACHEABLE_METHODS.includes(method);
    const isLongCache = LONG_CACHE_METHODS.includes(method);
    
    if (isCacheable) {
      const cacheKey = getCacheKey(method, params);
      const cachedResult = getFromCache(cacheKey);
      
      if (cachedResult !== null) {
        console.log(`Cache hit for ${method}`);
        return new Response(
          JSON.stringify({ jsonrpc: '2.0', result: cachedResult, id }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-Cache': 'HIT',
              'X-RateLimit-Remaining': String(rateLimit.remaining),
            } 
          }
        );
      }
    }

    // Get RPC URL from secrets
    const rpcUrl = Deno.env.get('SOLANA_RPC_URL');
    if (!rpcUrl) {
      console.error('SOLANA_RPC_URL secret not configured');
      // Fall back to public RPC (rate-limited)
      const fallbackUrl = 'https://api.mainnet-beta.solana.com';
      console.log(`Using fallback RPC: ${fallbackUrl}`);
    }

    const targetUrl = rpcUrl || 'https://api.mainnet-beta.solana.com';

    // Forward request to actual RPC
    console.log(`Proxying ${method} to RPC`);
    const rpcResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsonrpc, method, params, id }),
    });

    if (!rpcResponse.ok) {
      console.error(`RPC error: ${rpcResponse.status} ${rpcResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          jsonrpc: '2.0', 
          error: { code: -32603, message: 'RPC endpoint error' }, 
          id 
        }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const rpcData = await rpcResponse.json();

    // Cache successful responses for cacheable methods
    if (isCacheable && rpcData.result !== undefined && !rpcData.error) {
      const cacheKey = getCacheKey(method, params);
      setCache(cacheKey, rpcData.result, isLongCache);
    }

    return new Response(
      JSON.stringify(rpcData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        } 
      }
    );

  } catch (error) {
    console.error('RPC proxy error:', error);
    return new Response(
      JSON.stringify({ 
        jsonrpc: '2.0', 
        error: { code: -32603, message: 'Internal proxy error' }, 
        id: null 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
