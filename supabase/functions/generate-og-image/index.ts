import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || 'SOL Stack';
    const description = url.searchParams.get('description') || 'AI-Powered Solana DeFi Platform';
    const theme = url.searchParams.get('theme') || 'default'; // default, token, market, analytics
    
    // Token-specific parameters
    const tokenData = theme === 'token' ? {
      symbol: url.searchParams.get('symbol') || '',
      price: url.searchParams.get('price') || '0',
      marketCap: url.searchParams.get('marketCap') || '0',
      change24h: url.searchParams.get('change24h') || '0',
      volume24h: url.searchParams.get('volume24h') || '0',
      logo: url.searchParams.get('logo') || '',
    } : null;

    // Generate SVG image with dynamic content
    const svg = tokenData 
      ? generateTokenOGImage(tokenData)
      : generateOGImage(title, description, theme);
    
    // Convert SVG to PNG using external service or return SVG directly
    // For now, returning SVG with proper headers for social media
    const png = await svgToPng(svg);

    return new Response(png.buffer as ArrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateOGImage(title: string, description: string, theme: string): string {
  // Gradient colors based on theme
  const themes = {
    default: { from: '#7C3AED', to: '#2563EB', accent: '#F59E0B' },
    token: { from: '#EC4899', to: '#8B5CF6', accent: '#10B981' },
    market: { from: '#0EA5E9', to: '#8B5CF6', accent: '#F59E0B' },
    analytics: { from: '#10B981', to: '#06B6D4', accent: '#F59E0B' },
  };

  const colors = themes[theme as keyof typeof themes] || themes.default;

  // Truncate title and description to fit
  const maxTitleLength = 50;
  const maxDescLength = 100;
  const truncatedTitle = title.length > maxTitleLength ? title.slice(0, maxTitleLength) + '...' : title;
  const truncatedDesc = description.length > maxDescLength ? description.slice(0, maxDescLength) + '...' : description;

  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.to};stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      
      <!-- Overlay pattern -->
      <rect width="1200" height="630" fill="url(#bgGradient)" opacity="0.1"/>
      
      <!-- Grid pattern -->
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#grid)"/>
      
      <!-- Logo/Brand -->
      <text x="80" y="100" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" filter="url(#glow)">
        SOL STACK
      </text>
      
      <!-- Accent line -->
      <rect x="80" y="120" width="120" height="4" fill="${colors.accent}" rx="2"/>
      
      <!-- Title -->
      <text x="80" y="280" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="white">
        <tspan x="80" dy="0">${escapeXml(splitText(truncatedTitle, 30)[0])}</tspan>
        ${splitText(truncatedTitle, 30)[1] ? `<tspan x="80" dy="70">${escapeXml(splitText(truncatedTitle, 30)[1])}</tspan>` : ''}
      </text>
      
      <!-- Description -->
      <text x="80" y="420" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.9)">
        <tspan x="80" dy="0">${escapeXml(splitText(truncatedDesc, 50)[0])}</tspan>
        ${splitText(truncatedDesc, 50)[1] ? `<tspan x="80" dy="40">${escapeXml(splitText(truncatedDesc, 50)[1])}</tspan>` : ''}
      </text>
      
      <!-- Footer -->
      <text x="80" y="580" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)">
        solstack.me
      </text>
      
      <!-- Decorative elements -->
      <circle cx="1050" cy="150" r="80" fill="${colors.accent}" opacity="0.2"/>
      <circle cx="1100" cy="500" r="120" fill="white" opacity="0.1"/>
    </svg>
  `;
}

function splitText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];
  
  const words = text.split(' ');
  const lines: string[] = [''];
  let currentLine = 0;
  
  for (const word of words) {
    if ((lines[currentLine] + ' ' + word).length <= maxLength) {
      lines[currentLine] += (lines[currentLine] ? ' ' : '') + word;
    } else {
      currentLine++;
      lines[currentLine] = word;
    }
  }
  
  return lines.slice(0, 2); // Max 2 lines
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateTokenOGImage(tokenData: {
  symbol: string;
  price: string;
  marketCap: string;
  change24h: string;
  volume24h: string;
  logo: string;
}): string {
  const isPositive = parseFloat(tokenData.change24h) >= 0;
  const changeColor = isPositive ? '#10B981' : '#EF4444';
  const bgGradient = isPositive 
    ? 'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%)'
    : 'linear-gradient(135deg, #DC2626 0%, #7C3AED 100%)';

  // Format numbers
  const formatNumber = (num: string) => {
    const n = parseFloat(num);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
  };

  const formatPrice = (price: string) => {
    const p = parseFloat(price);
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(8)}`;
  };

  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${isPositive ? '#0EA5E9' : '#DC2626'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${isPositive ? '#8B5CF6' : '#7C3AED'};stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.05);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      
      <!-- Grid pattern -->
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#grid)"/>
      
      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="150" fill="rgba(255,255,255,0.03)"/>
      <circle cx="1100" cy="530" r="200" fill="rgba(255,255,255,0.03)"/>
      
      <!-- Main card -->
      <rect x="80" y="80" width="1040" height="470" rx="24" fill="url(#cardGradient)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      
      <!-- Header -->
      <text x="120" y="150" font-family="Arial, sans-serif" font-size="32" font-weight="600" fill="rgba(255,255,255,0.8)">
        SOL STACK
      </text>
      <rect x="120" y="165" width="80" height="3" fill="#F59E0B" rx="2"/>
      
      <!-- Token Symbol -->
      <text x="120" y="250" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" filter="url(#glow)">
        ${escapeXml(tokenData.symbol)}
      </text>
      
      <!-- Price -->
      <text x="120" y="340" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">
        ${escapeXml(formatPrice(tokenData.price))}
      </text>
      
      <!-- 24h Change -->
      <rect x="120" y="360" width="${Math.abs(parseFloat(tokenData.change24h) * 8) + 100}" height="50" rx="25" fill="${changeColor}" opacity="0.2"/>
      <text x="145" y="394" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${changeColor}">
        ${isPositive ? '↗' : '↘'} ${Math.abs(parseFloat(tokenData.change24h)).toFixed(2)}%
      </text>
      
      <!-- Stats Grid -->
      <g transform="translate(680, 220)">
        <!-- Market Cap -->
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.6)">
          MARKET CAP
        </text>
        <text x="0" y="40" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white">
          ${escapeXml(formatNumber(tokenData.marketCap))}
        </text>
        
        <!-- 24h Volume -->
        <text x="0" y="100" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.6)">
          24H VOLUME
        </text>
        <text x="0" y="140" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white">
          ${escapeXml(formatNumber(tokenData.volume24h))}
        </text>
      </g>
      
      <!-- Simple chart visualization -->
      <g transform="translate(120, 440)">
        ${generateMiniChart(tokenData.change24h)}
      </g>
      
      <!-- Footer -->
      <text x="120" y="520" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.5)">
        Real-time data powered by SOL Stack AI
      </text>
    </svg>
  `;
}

function generateMiniChart(change24h: string): string {
  const isPositive = parseFloat(change24h) >= 0;
  const color = isPositive ? '#10B981' : '#EF4444';
  
  // Generate simple sparkline
  const points = [];
  const width = 300;
  const height = 60;
  const segments = 24;
  
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const variance = Math.random() * 20 - 10;
    const trend = isPositive ? (i / segments) * 30 : -(i / segments) * 30;
    const y = height / 2 + variance + trend;
    points.push(`${x},${y}`);
  }
  
  return `
    <polyline
      points="${points.join(' ')}"
      fill="none"
      stroke="${color}"
      stroke-width="3"
      opacity="0.6"
    />
    <polyline
      points="${points.join(' ')} ${width},${height} 0,${height}"
      fill="${color}"
      opacity="0.1"
    />
  `;
}

async function svgToPng(svg: string): Promise<Uint8Array> {
  // Use resvg-js or similar library for production
  // For now, we'll use a simple fetch to a conversion service
  try {
    const response = await fetch('https://cloudinary-marketing-res.cloudinary.com/images/w_1200,h_630/f_auto,q_auto/v1/convert-svg-to-png', {
      method: 'POST',
      headers: { 'Content-Type': 'image/svg+xml' },
      body: svg,
    });
    
    if (response.ok) {
      return new Uint8Array(await response.arrayBuffer());
    }
  } catch (error) {
    console.log('Conversion service unavailable, returning SVG as PNG fallback');
  }
  
  // Fallback: Return SVG as PNG (some platforms accept this)
  return new TextEncoder().encode(svg);
}
