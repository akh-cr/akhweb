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
      // Transitional read boundary. Remove immediately after the persisted URL
      // migration confirms zero legacy AKH Storage references.
      {
        protocol: 'https',
        hostname: 'lwfpdjxsdmkfyrzqbrlk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
