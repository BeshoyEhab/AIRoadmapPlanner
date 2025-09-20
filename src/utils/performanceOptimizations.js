// Performance optimization utilities for AI Roadmap Planner
import React from 'react';

// Debounce utility to prevent excessive function calls
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility to limit function execution frequency
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory-efficient localStorage operations
export const optimizedStorage = {
  // Batch localStorage operations to reduce I/O
  batchOperations: (operations) => {
    const results = {};
    operations.forEach(({ key, value, operation }) => {
      try {
        switch (operation) {
          case 'get':
            results[key] = localStorage.getItem(key);
            break;
          case 'set':
            localStorage.setItem(key, value);
            results[key] = true;
            break;
          case 'remove':
            localStorage.removeItem(key);
            results[key] = true;
            break;
          default:
            results[key] = null;
        }
      } catch (error) {
        console.error(`Storage operation failed for key ${key}:`, error);
        results[key] = null;
      }
    });
    return results;
  },

  // Safe JSON operations with error handling
  safeGetJSON: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to parse JSON for key ${key}:`, error);
      return defaultValue;
    }
  },

  safeSetJSON: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set JSON for key ${key}:`, error);
      return false;
    }
  }
};

// Memory leak prevention utilities
export const memoryUtils = {
  // Clean up event listeners
  createCleanupManager: () => {
    const cleanupFunctions = [];
    
    return {
      add: (cleanupFn) => {
        cleanupFunctions.push(cleanupFn);
      },
      
      addEventListener: (element, event, handler, options) => {
        element.addEventListener(event, handler, options);
        cleanupFunctions.push(() => element.removeEventListener(event, handler, options));
      },
      
      cleanup: () => {
        cleanupFunctions.forEach(fn => {
          try {
            fn();
          } catch (error) {
            console.error('Cleanup function failed:', error);
          }
        });
        cleanupFunctions.length = 0;
      }
    };
  },

  // Weak reference cache for large objects
  createWeakCache: () => {
    const cache = new WeakMap();
    
    return {
      get: (key) => cache.get(key),
      set: (key, value) => cache.set(key, value),
      has: (key) => cache.has(key),
      delete: (key) => cache.delete(key)
    };
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }
};

// Component optimization utilities
export const componentUtils = {
  // Create memoized selectors
  createMemoizedSelector: (selector, equalityFn = Object.is) => {
    let lastArgs = [];
    let lastResult;
    
    return (...args) => {
      if (args.length !== lastArgs.length || !args.every((arg, i) => equalityFn(arg, lastArgs[i]))) {
        lastArgs = args;
        lastResult = selector(...args);
      }
      return lastResult;
    };
  },

  // Shallow comparison for React.memo
  shallowEqual: (objA, objB) => {
    if (Object.is(objA, objB)) {
      return true;
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (let i = 0; i < keysA.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }

    return true;
  }
};

// Bundle size optimization utilities
export const bundleUtils = {
  // Lazy import with retry logic
  lazyImportWithRetry: (importFn, retries = 3) => {
    return React.lazy(() => {
      return new Promise((resolve, reject) => {
        const attemptImport = (remainingRetries) => {
          importFn()
            .then(resolve)
            .catch((error) => {
              if (remainingRetries > 0) {
                setTimeout(() => attemptImport(remainingRetries - 1), 1000);
              } else {
                reject(error);
              }
            });
        };
        attemptImport(retries);
      });
    });
  },

  // Preload critical resources
  preloadResource: (href, as = 'script') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Performance monitoring utilities
export const performanceUtils = {
  // Measure component render time
  measureRenderTime: (componentName, renderFn) => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    if (end - start > 16) { // Log if render takes longer than one frame (16ms)
      console.warn(`Component ${componentName} took ${(end - start).toFixed(2)}ms to render`);
    }
    
    return result;
  },

  // Track memory usage over time
  createMemoryTracker: (interval = 5000) => {
    const measurements = [];
    let intervalId;
    
    return {
      start: () => {
        intervalId = setInterval(() => {
          const usage = memoryUtils.getMemoryUsage();
          if (usage) {
            measurements.push({
              timestamp: Date.now(),
              ...usage
            });
            
            // Keep only last 100 measurements
            if (measurements.length > 100) {
              measurements.shift();
            }
          }
        }, interval);
      },
      
      stop: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
      
      getReport: () => {
        if (measurements.length === 0) return null;
        
        const latest = measurements[measurements.length - 1];
        const oldest = measurements[0];
        const memoryGrowth = latest.used - oldest.used;
        
        return {
          currentUsage: latest.used,
          memoryGrowth,
          measurements: [...measurements]
        };
      }
    };
  }
};

// Export all utilities as a single object for convenience
export default {
  debounce,
  throttle,
  optimizedStorage,
  memoryUtils,
  componentUtils,
  bundleUtils,
  performanceUtils
};

