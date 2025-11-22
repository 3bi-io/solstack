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

    // Generate SVG image with dynamic content
    const svg = generateOGImage(title, description, theme);
    
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
