const { ROUTES } = require('./src/utils/constant');

module.exports = {
    reactStrictMode: false,
    compress: true,
    poweredByHeader: false,
    
    async rewrites() {
        return [
            {
                source: ROUTES.userDashboard,
                destination: ROUTES.userDashboardMain,
            }
        ];
    },
    
    images: {
        domains: ["localhost", "api.localxlist.net", "apilocalxlist.shrawantravels.com"],
        formats: ['image/webp'],
    },
    
    transpilePackages: ['react-bootstrap'],
};
