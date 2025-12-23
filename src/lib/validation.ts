import { z } from 'zod';

/**
 * Solana address validation regex
 * Base58 characters, 32-44 characters in length
 */
export const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Validate a Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  return SOLANA_ADDRESS_REGEX.test(address.trim());
}

/**
 * Sanitize a string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string, maxLength = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML injection
}

/**
 * Sanitize a Solana address (trim and validate)
 */
export function sanitizeSolanaAddress(address: string): string | null {
  const trimmed = address.trim();
  return isValidSolanaAddress(trimmed) ? trimmed : null;
}

/**
 * Rate limit tracker for client-side rate limiting
 */
class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  canProceed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.timestamps.get(key) || [];
    
    // Remove expired timestamps
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.timestamps.set(key, validTimestamps);
    return true;
  }

  getRemainingTime(key: string, windowMs: number): number {
    const timestamps = this.timestamps.get(key) || [];
    if (timestamps.length === 0) return 0;
    
    const oldestTimestamp = Math.min(...timestamps);
    const remainingTime = windowMs - (Date.now() - oldestTimestamp);
    return Math.max(0, remainingTime);
  }
}

export const clientRateLimiter = new RateLimiter();

/**
 * Common Zod schemas for validation
 */
export const schemas = {
  solanaAddress: z.string().regex(SOLANA_ADDRESS_REGEX, 'Invalid Solana address'),
  
  email: z.string().email('Invalid email address').max(255),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  tokenName: z.string()
    .min(1, 'Token name is required')
    .max(32, 'Token name must be less than 32 characters'),
  
  tokenSymbol: z.string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be less than 10 characters')
    .regex(/^[A-Z0-9]+$/i, 'Symbol can only contain letters and numbers'),
  
  amount: z.number()
    .positive('Amount must be positive')
    .max(1e15, 'Amount too large'),
  
  url: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
};

/**
 * Validate multiple Solana addresses
 */
export function validateAddresses(addresses: string[]): { 
  valid: string[]; 
  invalid: string[]; 
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  addresses.forEach(addr => {
    const sanitized = sanitizeSolanaAddress(addr);
    if (sanitized) {
      valid.push(sanitized);
    } else {
      invalid.push(addr);
    }
  });
  
  return { valid, invalid };
}
