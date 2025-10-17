
/* global PerformanceObserver, performance */
// The above line tells ESLint these browser globals are defined
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const PerformanceMonitor = () => {
  const router = useRouter();
  const performanceDataRef = useRef({});

  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;
    // Monitor Core Web Vitals
    const observePerformance = () => {
      // Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            performanceDataRef.current.lcp = entry.startTime;
          }
        }
      });
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch {
        // Fallback for browsers that don't support this
        console.warn('LCP monitoring not supported');
      }

      // First Input Delay (FID) and Cumulative Layout Shift (CLS)
      if (window && 'web-vital' in window) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS((metric) => {
            performanceDataRef.current.cls = metric.value;
          });
          getFID((metric) => {
            performanceDataRef.current.fid = metric.value;
          });
          getFCP((metric) => {
            performanceDataRef.current.fcp = metric.value;
          });
          getLCP((metric) => {
            performanceDataRef.current.lcp = metric.value;
          });
          getTTFB((metric) => {
            performanceDataRef.current.ttfb = metric.value;
          });
        }).catch(() => {
          // Fallback performance monitoring
          performanceDataRef.current = {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          };
        });
      }

      // Memory usage monitoring
      if (performance && 'memory' in performance) {
        performanceDataRef.current.memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }

      // Resource timing
      if (performance && performance.getEntriesByType) {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(resource => resource.duration > 1000);
        if (slowResources.length > 0) {
          performanceDataRef.current.slowResources = slowResources.map(r => ({
            name: r.name,
            duration: r.duration,
            size: r.transferSize || 0
          }));
        }
      }
    };
    observePerformance();

    // Monitor route changes for performance
    const handleRouteChangeStart = () => {
      performanceDataRef.current.routeChangeStart = Date.now();
    };

    const handleRouteChangeComplete = () => {
      if (performanceDataRef.current.routeChangeStart) {
        const duration = Date.now() - performanceDataRef.current.routeChangeStart;
        performanceDataRef.current.routeChangeDuration = duration;
        // Log performance data in development
        if (process.env.NODE_ENV === 'development' && duration > 2000) {
          console.warn(`Slow route change detected: ${duration}ms`);
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    // Cleanup
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  // Report performance data periodically (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const data = performanceDataRef.current;
        if (Object.keys(data).length > 0) {
          console.group('🚀 Performance Metrics');
          if (data.lcp) console.log(`LCP: ${data.lcp.toFixed(2)}ms`);
          if (data.fid) console.log(`FID: ${data.fid.toFixed(2)}ms`);
          if (data.cls) console.log(`CLS: ${data.cls.toFixed(3)}`);
          if (data.fcp) console.log(`FCP: ${data.fcp.toFixed(2)}ms`);
          if (data.ttfb) console.log(`TTFB: ${data.ttfb.toFixed(2)}ms`);
          if (data.memory) {
            console.log(`Memory: ${(data.memory.used / 1048576).toFixed(2)}MB used`);
          }
          if (data.routeChangeDuration) {
            console.log(`Last Route Change: ${data.routeChangeDuration}ms`);
          }
          console.groupEnd();
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;