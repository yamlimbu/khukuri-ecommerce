import {NextConfig} from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        // This is necessary to display images from your local Vendure instance
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                hostname: 'readonlydemo.vendure.io',
            },
            {
                hostname: 'demo.vendure.io'
            },
            {
                hostname: 'localhost'
            },
            {
                hostname: 'khukuri1-ecommerce.onrender.com',
                protocol: 'https'
            },
            {
                hostname: 'khukuri-ecommerce.onrender.com',
                protocol: 'https'
            }
        ],
    },
    experimental: {
        rootParams: true
    }
};

export default nextConfig;