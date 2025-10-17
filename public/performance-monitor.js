/**
 * Manual Performance Monitor
 * 
 * This script can be manually executed in the browser console
 * to check performance metrics without interfering with HMR.
 * 
 * Usage: Copy and paste this code into your browser's console
 */

(function() {
    console.log('🚀 LocalXList Performance Monitor');
    
    // Check Core Web Vitals if available
    if (typeof window !== 'undefined') {
        // Performance metrics
        const performanceData = {
            // Navigation timing
            navigation: performance.getEntriesByType('navigation')[0],
            // Resource timing
            resources: performance.getEntriesByType('resource'),
            // Memory usage (if available)
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            } : null
        };

        console.group('📊 Performance Metrics');
        
        // Navigation timing
        if (performanceData.navigation) {
            const nav = performanceData.navigation;
            console.log(`⏱️ Page Load Time: ${(nav.loadEventEnd - nav.navigationStart).toFixed(2)}ms`);
            console.log(`🔄 DOM Content Loaded: ${(nav.domContentLoadedEventEnd - nav.navigationStart).toFixed(2)}ms`);
            console.log(`🎨 First Paint: ${nav.responseStart - nav.navigationStart}ms`);
        }

        // Memory usage
        if (performanceData.memory) {
            const mem = performanceData.memory;
            console.log(`💾 Memory Used: ${mem.used}MB / ${mem.total}MB (${((mem.used/mem.total)*100).toFixed(1)}%)`);
        }

        // Slow resources (>1000ms)
        const slowResources = performanceData.resources
            .filter(resource => resource.duration > 1000)
            .map(resource => ({
                name: resource.name.split('/').pop(),
                duration: Math.round(resource.duration),
                size: resource.transferSize || 0
            }));

        if (slowResources.length > 0) {
            console.warn('⚠️ Slow Resources (>1000ms):');
            slowResources.forEach(resource => {
                console.log(`   • ${resource.name}: ${resource.duration}ms (${(resource.size/1024).toFixed(1)}KB)`);
            });
        }

        console.groupEnd();

        // Check for web vitals library and report if available
        if (window.webVitals) {
            window.webVitals.getCLS(console.log);
            window.webVitals.getFID(console.log);
            window.webVitals.getFCP(console.log);
            window.webVitals.getLCP(console.log);
            window.webVitals.getTTFB(console.log);
        }

        // Bundle size analysis
        if (window.__NEXT_DATA__) {
            const chunks = Object.keys(window.__NEXT_DATA__.buildManifest || {});
            console.log('📦 Loaded Chunks:', chunks.length);
        }
    }

    // Provide helper functions
    window.performanceHelper = {
        // Clear all caches
        clearCaches: function() {
            if ('caches' in window) {
                caches.keys().then(names => {
                    return Promise.all(names.map(name => caches.delete(name)));
                }).then(() => {
                    console.log('✅ All caches cleared');
                    location.reload();
                });
            }
        },

        // Measure a function's performance
        measure: function(fn, name = 'Function') {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`⏱️ ${name} took: ${(end - start).toFixed(2)}ms`);
            return result;
        },

        // Check current performance
        check: arguments.callee
    };

    console.log('✨ Performance helper functions available:');
    console.log('   • performanceHelper.check() - Run this analysis again');
    console.log('   • performanceHelper.clearCaches() - Clear all caches');
    console.log('   • performanceHelper.measure(fn, name) - Measure function performance');
})();