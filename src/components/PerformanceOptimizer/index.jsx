import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';

const PerformanceOptimizer = ({ children }) => {
  const router = useRouter();
  const preloadTimeoutRef = useRef(null);
  const preloadedRoutes = useRef(new Set());

  // Preload critical routes
  const preloadRoute = useCallback((route) => {
    if (!preloadedRoutes.current.has(route)) {
      router.prefetch(route);
      preloadedRoutes.current.add(route);
    }
  }, [router]);

  // Intelligent route preloading
  useEffect(() => {
    // Preload critical routes based on current page
    const currentRoute = router.asPath;
    
    // Common navigation patterns - preload likely next pages
    const routePreloadMap = {
      '/': ['/login', '/signup', '/partners'],
      '/login': ['/user-dashboard'],
      '/signup': ['/signup-verification'],
      '/partners': ['/partners/categories'],
      '/user-dashboard': ['/user-create-post', '/user-all-post']
    };

    const routesToPreload = routePreloadMap[currentRoute] || [];
    
    // Delay preloading to avoid blocking main thread
    preloadTimeoutRef.current = setTimeout(() => {
      routesToPreload.forEach(preloadRoute);
    }, 2000); // Wait 2 seconds after page load

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [router.asPath, preloadRoute]);

  // Prefetch on hover/focus with debouncing
  useEffect(() => {
    let hoverTimeout;

    const handleLinkHover = (event) => {
      const link = event.target.closest('a[href]');
      if (link && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          preloadRoute(path);
        }, 100); // Debounce hover events
      }
    };

    const handleLinkFocus = (event) => {
      const link = event.target.closest('a[href]');
      if (link && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        preloadRoute(path);
      }
    };

    // Add event listeners for intelligent prefetching
    document.addEventListener('mouseenter', handleLinkHover, true);
    document.addEventListener('focus', handleLinkFocus, true);

    return () => {
      document.removeEventListener('mouseenter', handleLinkHover, true);
      document.removeEventListener('focus', handleLinkFocus, true);
      clearTimeout(hoverTimeout);
    };
  }, [preloadRoute]);

  // Image optimization helper
  useEffect(() => {
    // Intersection Observer for lazy loading images
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image comes into view
        threshold: 0.01
      }
    );

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));

    return () => {
      lazyImages.forEach((img) => imageObserver.unobserve(img));
    };
  }, []);

  // Resource hints optimization
  useEffect(() => {
    // Add DNS prefetch for external domains
    const externalDomains = [
      'api.localxlist.net',
      'apilocalxlist.shrawantravels.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    externalDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical external resources
    const criticalDomains = ['api.localxlist.net', 'apilocalxlist.shrawantravels.com'];
    criticalDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  // Memory cleanup and garbage collection hints
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Force garbage collection in development (if available)
      if (process.env.NODE_ENV === 'development' && window.gc) {
        window.gc();
      }

      // Clear unused prefetched routes
      if (preloadedRoutes.current.size > 50) {
        preloadedRoutes.current.clear();
      }
    }, 60000); // Every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // Service Worker registration for caching (if available)
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return children;
};

export default PerformanceOptimizer;