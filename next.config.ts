import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Uncomment for strict static export
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75, 80, 85, 100],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'akh.img.festapp.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
