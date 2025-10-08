import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MerkleAirdropRequest {
  tokenAddress: string;
  recipients: Array<{ address: string; amount: number }>;
  userId: string;
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
    const { tokenAddress, recipients, userId }: MerkleAirdropRequest = await req.json();

    console.log('Creating Merkle airdrop:', { tokenAddress, recipientCount: recipients.length });

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
