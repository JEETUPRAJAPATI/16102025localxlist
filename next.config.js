/*global require*/
/*eslint no-undef: "error"*/
const { ROUTES } = require('./src/utils/constant');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
    async rewrites() {
        return [
            {
                source: ROUTES.userDashboard,
                destination: ROUTES.userDashboardMain,
            },
            {
                source: '/sitemap-pages.xml',
                destination: '/sitemap/posts/static-pages',
            },
            {
                source: '/sitemap-posts-:page.xml',
                destination: '/sitemap/posts/:page',
            },
            {
                source: '/sitemap-categories.xml',
                destination: '/sitemap/posts/categories',
            },
            {
                source: '/sitemap-partners.xml',
                destination: '/sitemap/posts/partners',
            },
        ];
    },
    // Standard configuration
    productionBrowserSourceMaps: false,
    compress: true,
    // Experimental features (keep only valid ones)
    experimental: {
        optimizePackageImports: [
            'react-bootstrap',
            'react-google-recaptcha',
            'react-player',
            'yet-another-react-lightbox',
            '@tinymce/tinymce-react'
        ],
        // Remove modularizeImports as it's now handled by optimizePackageImports
    },

    webpack: (config, { isServer, dev }) => {
        console.log('Environment:', {
            NODE_ENV: process.env.NODE_ENV,
            isServer,
            isDev: dev
        });

        // Only optimize in production
        config.optimization = {
            ...config.optimization,
            splitChunks: {
                chunks: 'async',
                minSize: 20000, // 20KB minimum chunk size
                maxSize: 244 * 1024, // 244KB maximum chunk size
                minChunks: 1,
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                automaticNameDelimiter: '~',
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                        name(module) {
                            const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                            if (!match) return 'vendor.unknown';
                            const packageName = match[1];
                            // Group smaller utilities together to reduce chunk count
                            if (['axios', 'js-cookie', 'query-string', 'formik', 'yup', 'dompurify', 'html-react-parser'].includes(packageName)) {
                                return 'vendor.utils';
                            }
                            return `vendor.${packageName.replace('@', '')}`;
                        },
                    },
                    // Core React and Redux
                    reactCore: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-redux|redux|@reduxjs\/toolkit|next-redux-wrapper|redux-logger|reselect|scheduler)[\\/]/,
                        name: 'react-core',
                        chunks: 'all',
                        priority: 20,
                    },
                    bootstrap: {
                        test: /[\\/]node_modules[\\/]bootstrap[\\/]/,
                        name: 'bootstrap',
                        chunks: 'all',
                        priority: 12,
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
            }
        };

        return config;
    },
    // SCSS configuration
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
    // Images configuration
    images: {
        domains: ["localhost", "api.localxlist.net", "apilocalxlist.shrawantravels.com"],
        unoptimized: true, // Disable image optimization for static export
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        formats: ['image/webp'],
    },
    // For React Bootstrap
    transpilePackages: ['react-bootstrap'],
});