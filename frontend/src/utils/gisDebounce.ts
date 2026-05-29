/**
 * Debounce Utility
 * Delays function execution until after a specified wait time has elapsed
 * since the last time it was invoked.
 * 
 * Use cases:
 * - Search input (wait for user to stop typing)
 * - Map bounds changes (wait for user to stop panning)
 * - Window resize events
 * - Auto-save functionality
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Throttle Utility
 * Ensures function is called at most once per specified time period
 * 
 * Use cases:
 * - Scroll events
 * - Mouse move events
 * - API calls that should have minimum interval
 */

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce with leading edge
 * Calls function immediately on first invocation, then debounces subsequent calls
 */

export function debounceLeading<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastCallTime = 0;

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastCallTime > wait) {
      // Immediate execution if enough time has passed
      func(...args);
      lastCallTime = now;
    } else {
      // Debounce subsequent calls
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
        lastCallTime = Date.now();
        timeout = null;
      }, wait);
    }
  };
}

