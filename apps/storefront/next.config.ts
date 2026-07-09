import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    unoptimized: true,
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
        hostname: '127.0.0.1',
        port: '3002',
        pathname: '/assets/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/assets/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
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
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.himalayankhukuri.com',
          },
        ],
        destination: 'https://himalayankhukuri.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;