import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Solana address validation regex (base58 format, 32-44 chars)
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Validation limits
const MAX_RECIPIENTS = 10000;
const MAX_AMOUNT = 1e15; // Maximum token amount per recipient
const MIN_AMOUNT = 0;

interface Recipient {
  address: string;
  amount: number;
}

interface MerkleAirdropRequest {
  tokenAddress: string;
  recipients: Recipient[];
  userId: string;
}

// Validation functions
function isValidSolanaAddress(address: string): boolean {
  return typeof address === 'string' && SOLANA_ADDRESS_REGEX.test(address);
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
}

function validateRequest(data: unknown): { valid: true; data: MerkleAirdropRequest } | { valid: false; error: string } {
  // Type check the root object
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const req = data as Record<string, unknown>;

  // Validate tokenAddress
  if (!req.tokenAddress || typeof req.tokenAddress !== 'string') {
    return { valid: false, error: 'tokenAddress is required and must be a string' };
  }
  if (!isValidSolanaAddress(req.tokenAddress)) {
    return { valid: false, error: 'tokenAddress must be a valid Solana address (base58, 32-44 characters)' };
  }

  // Validate userId
  if (!req.userId || typeof req.userId !== 'string') {
    return { valid: false, error: 'userId is required and must be a string' };
  }
  if (!isValidUUID(req.userId)) {
    return { valid: false, error: 'userId must be a valid UUID' };
  }

  // Validate recipients array
  if (!Array.isArray(req.recipients)) {
    return { valid: false, error: 'recipients must be an array' };
  }
  if (req.recipients.length === 0) {
    return { valid: false, error: 'recipients array cannot be empty' };
  }
  if (req.recipients.length > MAX_RECIPIENTS) {
    return { valid: false, error: `recipients array cannot exceed ${MAX_RECIPIENTS} entries` };
  }

  // Validate each recipient
  const validatedRecipients: Recipient[] = [];
  const seenAddresses = new Set<string>();

  for (let i = 0; i < req.recipients.length; i++) {
    const recipient = req.recipients[i];
    
    if (!recipient || typeof recipient !== 'object') {
      return { valid: false, error: `recipients[${i}] must be an object` };
    }

    const r = recipient as Record<string, unknown>;

    // Validate address
    if (!r.address || typeof r.address !== 'string') {
      return { valid: false, error: `recipients[${i}].address is required and must be a string` };
    }
    if (!isValidSolanaAddress(r.address)) {
      return { valid: false, error: `recipients[${i}].address must be a valid Solana address` };
    }

    // Check for duplicate addresses
    if (seenAddresses.has(r.address)) {
      return { valid: false, error: `Duplicate recipient address found: ${r.address}` };
    }
    seenAddresses.add(r.address);

    // Validate amount
    if (typeof r.amount !== 'number') {
      return { valid: false, error: `recipients[${i}].amount must be a number` };
    }
    if (!Number.isFinite(r.amount)) {
      return { valid: false, error: `recipients[${i}].amount must be a finite number` };
    }
    if (r.amount <= MIN_AMOUNT) {
      return { valid: false, error: `recipients[${i}].amount must be greater than ${MIN_AMOUNT}` };
    }
    if (r.amount > MAX_AMOUNT) {
      return { valid: false, error: `recipients[${i}].amount cannot exceed ${MAX_AMOUNT}` };
    }

    validatedRecipients.push({
      address: r.address,
      amount: r.amount,
    });
  }

  return {
    valid: true,
    data: {
      tokenAddress: req.tokenAddress,
      recipients: validatedRecipients,
      userId: req.userId,
    },
  };
}

// Extract and validate JWT from Authorization header
function extractUserIdFromAuth(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    // Decode JWT payload (base64url)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.sub || null;
  } catch {
    return null;
  }
}

// Simple Merkle tree implementation
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPair(a: string, b: string): Promise<string> {
  const sorted = [a, b].sort();
  return await hashString(sorted[0] + sorted[1]);
}

async function buildMerkleTree(leaves: string[]): Promise<{ root: string; tree: string[][]; proofs: Record<string, string[]> }> {
  if (leaves.length === 0) throw new Error('No leaves provided');
  
  const tree: string[][] = [leaves];
  const proofs: Record<string, string[]> = {};
  
  // Initialize proofs
  leaves.forEach((leaf, index) => {
    proofs[index] = [];
  });
  
  // Build tree layers
  while (tree[tree.length - 1].length > 1) {
    const layer = tree[tree.length - 1];
    const nextLayer: string[] = [];
    
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        nextLayer.push(await hashPair(layer[i], layer[i + 1]));
      } else {
        nextLayer.push(layer[i]); // Odd node carries forward
      }
    }
    
    tree.push(nextLayer);
  }
  
  // Generate proofs for each leaf
  leaves.forEach((_, leafIndex) => {
    let index = leafIndex;
    
    for (let level = 0; level < tree.length - 1; level++) {
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;
      
      if (siblingIndex < tree[level].length) {
        proofs[leafIndex].push(tree[level][siblingIndex]);
      }
      
      index = Math.floor(index / 2);
    }
  });
  
  return {
    root: tree[tree.length - 1][0],
    tree,
    proofs
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract authenticated user ID from JWT
    const authHeader = req.headers.get('authorization');
    const authenticatedUserId = extractUserIdFromAuth(authHeader);

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateRequest(requestBody);
    if (!validation.valid) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tokenAddress, recipients, userId } = validation.data;

    // Verify userId matches authenticated user (if auth header present)
    if (authenticatedUserId && authenticatedUserId !== userId) {
      console.error('User ID mismatch:', { authenticatedUserId, providedUserId: userId });
      return new Response(
        JSON.stringify({ error: 'userId does not match authenticated user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Merkle airdrop:', { 
      tokenAddress, 
      recipientCount: recipients.length,
      userId 
    });

    // Create leaf nodes (hash of address + amount)
    const leaves = await Promise.all(
      recipients.map(async (recipient) => {
        const leaf = `${recipient.address}:${recipient.amount}`;
        return await hashString(leaf);
      })
    );

    // Build Merkle tree
    const { root, tree, proofs } = await buildMerkleTree(leaves);

    // Calculate total amount
    const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);

    // Store Merkle airdrop
    const { data: merkleAirdrop, error: airdropError } = await supabase
      .from('merkle_airdrops' as any)
      .insert({
        user_id: userId,
        token_address: tokenAddress,
        total_amount: totalAmount,
        total_recipients: recipients.length,
        merkle_root: root,
        merkle_tree: tree,
        status: 'active'
      })
      .select()
      .single();

    if (airdropError) throw airdropError;

    // Store claims with proofs
    const claims = recipients.map((recipient, index) => ({
      merkle_airdrop_id: merkleAirdrop.id,
      recipient_address: recipient.address,
      amount: recipient.amount,
      proof: proofs[index],
      claimed: false
    }));

    const { error: claimsError } = await supabase
      .from('merkle_claims' as any)
      .insert(claims);

    if (claimsError) throw claimsError;

    // Log the event
    await supabase.from('activity_logs').insert({
      user_id: userId,
      category: 'airdrop',
      level: 'info',
      message: `Merkle airdrop created with ${recipients.length} recipients`,
      details: `Token: ${tokenAddress}, Total: ${totalAmount}`,
      metadata: { 
        merkle_airdrop_id: merkleAirdrop.id,
        merkle_root: root,
        recipient_count: recipients.length
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        airdropId: merkleAirdrop.id,
        merkleRoot: root,
        totalRecipients: recipients.length,
        totalAmount,
        claimUrl: `${supabaseUrl.replace('supabase.co', 'lovable.app')}/claim/${merkleAirdrop.id}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-merkle-airdrop:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});