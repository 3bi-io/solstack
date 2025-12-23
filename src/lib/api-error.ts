import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Parse an error into a standardized format
 */
export function parseError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
    };
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: String(err.message || err.error || 'An error occurred'),
      code: String(err.code || 'UNKNOWN'),
      status: typeof err.status === 'number' ? err.status : undefined,
      details: err.details,
    };
  }
  
  return {
    message: String(error) || 'An unknown error occurred',
    code: 'UNKNOWN',
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiError): string {
  // Network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Rate limiting
  if (error.status === 429 || error.message.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Authentication errors
  if (error.status === 401 || error.message.includes('unauthorized')) {
    return 'Please sign in to continue.';
  }
  
  // Permission errors
  if (error.status === 403 || error.message.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Not found
  if (error.status === 404) {
    return 'The requested resource was not found.';
  }
  
  // Server errors
  if (error.status && error.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  // Wallet errors
  if (error.message.includes('wallet') || error.message.includes('signature')) {
    return 'Wallet error. Please check your wallet connection and try again.';
  }
  
  // Insufficient funds
  if (error.message.includes('insufficient') || error.message.includes('balance')) {
    return 'Insufficient funds for this transaction.';
  }
  
  return error.message;
}

/**
 * Show error toast with user-friendly message
 */
export function showErrorToast(error: unknown, title = 'Error'): void {
  const parsed = parseError(error);
  const message = getUserFriendlyMessage(parsed);
  
  toast({
    title,
    description: message,
    variant: 'destructive',
  });
  
  // Log full error for debugging
  console.error('[API Error]', parsed);
}

/**
 * Hook-compatible error handler
 */
export function handleApiError(error: unknown): never {
  const parsed = parseError(error);
  showErrorToast(parsed);
  throw new Error(parsed.message);
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      const parsed = parseError(error);
      if (parsed.status && parsed.status >= 400 && parsed.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
