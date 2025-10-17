const { ROUTES } = require('./src/utils/constant');

module.exports = {
    // Performance Optimizations
    reactStrictMode: false, // Keep as requested
    compress: true,
    poweredByHeader: false,
    // swcMinify is enabled by default in Next.js 15+
    
    // Experimental features for better performance
    experimental: {
        // optimizeCss: true, // Temporarily disabled - can cause issues in development
        scrollRestoration: true, // Better scroll behavior
        optimizePackageImports: [
            'react-bootstrap',
            '@fortawesome/react-fontawesome',
            '@fortawesome/free-solid-svg-icons',
            'react-html-parser'
        ],
    },

    // URL Rewrites
    async rewrites() {
        return [
            {
                source: ROUTES.userDashboard,
                destination: ROUTES.userDashboardMain,
            }
        ];
    },

    // Advanced webpack configuration for performance
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Production optimizations
        if (!dev) {
            // Enable tree shaking
            config.optimization.usedExports = true;
            config.optimization.sideEffects = false;
            
            // Advanced code splitting
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    // Vendor chunk for stable libraries
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    // React and React-DOM
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: 'react',
                        chunks: 'all',
                        priority: 30,
                    },
                    // Redux and related libraries
                    redux: {
                        test: /[\\/]node_modules[\\/](react-redux|@reduxjs\/toolkit|redux)[\\/]/,
                        name: 'redux',
                        chunks: 'all',
                        priority: 25,
                    },
                    // React Bootstrap
                    reactBootstrap: {
                        test: /[\\/]node_modules[\\/](react-bootstrap)[\\/]/,
                        name: 'react-bootstrap',
                        chunks: 'all',
                        priority: 15,
                    },
                    // FontAwesome
                    fontawesome: {
                        test: /[\\/]node_modules[\\/](@fortawesome)[\\/]/,
                        name: 'fontawesome',
                        chunks: 'all',
                        priority: 10,
                    },
                    // Heavy third-party libraries
                    heavyLibs: {
                        test: /[\\/]node_modules[\\/](react-player|yet-another-react-lightbox|@tinymce\/tinymce-react|react-google-recaptcha|croppie)[\\/]/,
                        name: 'heavy-libs',
                        chunks: 'all',
                        priority: 5,
                    },
                    // Common code across pages
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 2,
                        priority: 0,
                        reuseExistingChunk: true,
                    },
                    styles: {
                        name: 'styles',
                        test: /\.css$|\.scss$/,
                        chunks: 'all',
                        enforce: true,
                        priority: 25,
                        reuseExistingChunk: true,
                    }
                }
            };
        }

        return config;
    },

    // SCSS configuration for performance
    sassOptions: {
        quietDeps: true,
        logger: {
            warn: function (message, { deprecation }) {
                if (deprecation) return;
                console.warn(message);
            }
        },
        includePaths: ['styles'],
    },

    // Enhanced image optimization
    images: {
        domains: ["localhost", "api.localxlist.net", "apilocalxlist.shrawantravels.com"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 86400, // 24 hours cache
        formats: ['image/webp', 'image/avif'], // Support modern formats
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error']
        } : false,
    },

    // Package transpilation for better compatibility
    transpilePackages: [
        'react-bootstrap',
        '@fortawesome/react-fontawesome',
        '@fortawesome/free-solid-svg-icons',
        'react-html-parser'
    ],

    // Output optimization (only for production builds)
    // output: 'standalone', // Disabled for development mode

    // Headers for performance and security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            },
            {
                source: '/(.*).jpg',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400'
                    }
                ]
            },
            {
                source: '/(.*).png',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400'
                    }
                ]
            },
            {
                source: '/(.*).webp',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400'
                    }
                ]
            }
        ];
    }
};
