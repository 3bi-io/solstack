import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from "https://esm.sh/@solana/web3.js@1.95.8";

/**
 * BIP39/BIP44 compliant wallet derivation
 * Production-ready implementation using proper cryptographic standards
 */
export async function deriveKeypairFromSeedPhrase(seedPhrase: string): Promise<Keypair | null> {
  try {
    // Import BIP39 and BIP32 libraries
    const { mnemonicToSeedSync } = await import("https://esm.sh/@scure/bip39@1.2.1");
    const { HDKey } = await import("https://esm.sh/@scure/bip32@1.3.2");
    
    // Convert mnemonic to seed
    const seed = mnemonicToSeedSync(seedPhrase);
    
    // Derive keypair using Solana's standard derivation path
    const derivationPath = "m/44'/501'/0'/0'"; // Phantom standard
    const hd = HDKey.fromMasterSeed(seed);
    const derived = hd.derive(derivationPath);
    
    if (!derived.privateKey) {
      throw new Error("Failed to derive private key");
    }
    
    // Create Keypair from derived seed
    return Keypair.fromSeed(derived.privateKey.slice(0, 32));
  } catch (error) {
    console.error("Error deriving keypair:", error);
    return null;
  }
}

/**
 * Simulate transaction before execution to prevent failures
 * Returns simulation result with success/failure and logs
 */
export async function simulateTransaction(
  connection: Connection,
  transaction: Transaction | VersionedTransaction,
  signers: Keypair[]
): Promise<{ success: boolean; error?: string; logs?: string[] }> {
  try {
    let simulation;
    
    if (transaction instanceof VersionedTransaction) {
      simulation = await connection.simulateTransaction(transaction);
    } else {
      // Sign the transaction for simulation
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.sign(...signers);
      simulation = await connection.simulateTransaction(transaction);
    }
    
    if (simulation.value.err) {
      return {
        success: false,
        error: JSON.stringify(simulation.value.err),
        logs: simulation.value.logs || []
      };
    }
    
    return {
      success: true,
      logs: simulation.value.logs || []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Simulation failed"
    };
  }
}

/**
 * Validate Solana public key
 */
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get network configuration based on environment
 */
export function getSolanaRpcUrl(): string {
  // Check environment variable, default to mainnet
  const envUrl = Deno.env.get("SOLANA_RPC_URL");
  
  if (envUrl) {
    return envUrl;
  }
  
  // Default to mainnet for production
  return "https://api.mainnet-beta.solana.com";
}

/**
 * Check if sufficient SOL balance for transaction
 */
export async function checkSufficientBalance(
  connection: Connection,
  publicKey: PublicKey,
  requiredLamports: number
): Promise<{ sufficient: boolean; balance: number; required: number }> {
  const balance = await connection.getBalance(publicKey);
  
  return {
    sufficient: balance >= requiredLamports,
    balance,
    required: requiredLamports
  };
}
