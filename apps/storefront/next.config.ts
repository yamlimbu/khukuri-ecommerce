import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/assets/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'readonlydemo.vendure.io',
      },
      {
        protocol: 'https',
        hostname: 'demo.vendure.io',
      },
      {
        protocol: 'https',
        hostname: 'himalayankhukuri.com',
      },
    ],
  },
  experimental: {
    rootParams: true,
  },
};

export default nextConfig;