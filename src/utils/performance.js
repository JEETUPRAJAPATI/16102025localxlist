/* global performance */
/**
 * Performance utilities for optimizing API calls and data handling
 */

import React from 'react';

// Request caching with TTL
const cache = new Map();
const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
};

/**
 * Cache API responses with TTL
 */
export const withCache = (apiFunction, ttl = CACHE_TTL.MEDIUM) => {
  return async (...args) => {
    const cacheKey = JSON.stringify([apiFunction.name, ...args]);
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    try {
      const result = await apiFunction(...args);
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      // Clean up old cache entries periodically
      if (cache.size > 100) {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
          if (now - value.timestamp > ttl) {
            cache.delete(key);
          }
        }
      }
      
      return result;
    } catch (error) {
      // Return cached data if available on error
      if (cached) {
        console.warn('API error, returning cached data:', error);
        return cached.data;
      }
      throw error;
    }
  };
};

/**
 * Debounce function calls to prevent excessive API requests
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Batch multiple API requests
 */
export const batchRequests = async (requests, batchSize = 3) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(request => typeof request === 'function' ? request() : request)
    );
    
    results.push(...batchResults.map(result => 
      result.status === 'fulfilled' ? result.value : null
    ));
  }
  
  return results;
};

/**
 * Retry API calls with exponential backoff
 */
export const withRetry = (apiFunction, maxRetries = 3) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};

/**
 * Preload data for better UX
 */
export const preloadData = (apiFunction, ...args) => {
  // Use requestIdleCallback if available, otherwise setTimeout
  if (typeof window !== 'undefined') {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        apiFunction(...args).catch(() => {
          // Silently handle preload errors
        });
      });
    } else {
      setTimeout(() => {
        apiFunction(...args).catch(() => {
          // Silently handle preload errors
        });
      }, 0);
    }
  }
};

/**
 * Optimize image loading
 */
export const optimizeImage = (src, { width, height, quality = 75 } = {}) => {
  if (!src) return src;
  // If it's already an optimized URL, return as is
  if (src.includes('/_next/image') || src.includes('w_') || src.includes('q_')) {
    return src;
  }
  // For Next.js image optimization
  if (typeof window !== 'undefined' && typeof window.URLSearchParams !== 'undefined') {
    const params = new window.URLSearchParams();
    if (width) params.set('w', width);
    if (height) params.set('h', height);
    if (quality) params.set('q', quality);
    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  }
  return src;
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  }
  return null;
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
  cache.clear();
  // Clear browser caches if available
  if (typeof window !== 'undefined' && 'caches' in window) {
    window.caches.keys().then(names => {
      names.forEach(name => {
        window.caches.delete(name);
      });
    });
  }
};

/**
 * Lazy load modules
 */
export const lazyImport = (importFunction) => {
  // Return a no-op on server
  if (typeof window === 'undefined') return () => null;

  // Use React.lazy with dynamic import in browser
  return React.lazy(() =>
    importFunction().catch(err => {
      console.error('Module loading failed:', err);
      return { default: () => React.createElement('div', null, 'Loading failed') };
    })
  );
};

export default {
  withCache,
  debounce,
  throttle,
  batchRequests,
  withRetry,
  preloadData,
  optimizeImage,
  getMemoryUsage,
  clearAllCaches,
  lazyImport,
  CACHE_TTL
};