/**
 * Client-side rate limiter for API calls
 * Prevents excessive requests to external APIs
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultLimit: number;
  private windowMs: number;

  constructor(defaultLimit = 30, windowMs = 60000) {
    this.defaultLimit = defaultLimit;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request is allowed
   */
  canMakeRequest(key: string, limit?: number): boolean {
    const maxRequests = limit ?? this.defaultLimit;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      this.limits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemainingRequests(key: string, limit?: number): number {
    const maxRequests = limit ?? this.defaultLimit;
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() > entry.resetAt) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get time until rate limit resets (ms)
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetAt - Date.now());
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Singleton instances for different APIs
export const priceApiLimiter = new RateLimiter(60, 60000); // 60 requests per minute
export const jupiterApiLimiter = new RateLimiter(30, 60000); // 30 requests per minute
export const supabaseApiLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Wait for rate limit to reset
 */
export async function waitForRateLimit(key: string, limiter: RateLimiter): Promise<void> {
  const resetTime = limiter.getResetTime(key);
  if (resetTime > 0) {
    await new Promise(resolve => setTimeout(resolve, resetTime + 100));
  }
}

/**
 * Execute with rate limiting
 */
export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
  limiter: RateLimiter = priceApiLimiter,
  limit?: number
): Promise<T> {
  if (!limiter.canMakeRequest(key, limit)) {
    await waitForRateLimit(key, limiter);
    if (!limiter.canMakeRequest(key, limit)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }
  return fn();
}

export { RateLimiter };
