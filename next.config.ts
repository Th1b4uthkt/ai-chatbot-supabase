import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'phanganlife.com',
      },
      {
        hostname: 'phangan.events',
      },
      {
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  webpack: (config) => {
    // This fixes source map issues with Supabase client
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any specific problematic modules here if needed
    };
    // Enable better source maps
    config.devtool = 'source-map';
    
    return config;
  },
};

export default nextConfig;
