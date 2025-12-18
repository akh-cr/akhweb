import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Uncomment for strict static export
  images: {
    // unoptimized: true, // Required for static export without external loader
  },
};

export default nextConfig;
