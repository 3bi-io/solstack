/**
 * Hard Refresh Utility
 * Forces a full page reload to ensure users get the latest code and data
 */

/**
 * Performs a hard refresh of the application
 * @param clearCache - Whether to clear localStorage caches before reload
 */
export const hardRefresh = (clearCache: boolean = false): void => {
  if (clearCache) {
    // Clear specific app caches while preserving user preferences
    const keysToPreserve = ['solstack-onboarding-completed', 'theme', 'marketFavorites'];
    const preservedValues: Record<string, string | null> = {};
    
    // Save values to preserve
    keysToPreserve.forEach(key => {
      preservedValues[key] = localStorage.getItem(key);
    });
    
    // Clear all localStorage
    localStorage.clear();
    
    // Restore preserved values
    Object.entries(preservedValues).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(key, value);
      }
    });
  }
  
  // Force reload from server, bypassing cache
  window.location.reload();
};

/**
 * Performs a hard refresh with cache-busting query parameter
 * This ensures the browser fetches fresh resources
 */
export const forceHardRefresh = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('_refresh', Date.now().toString());
  window.location.href = url.toString();
};
