import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@clndr/react', '@clndr/sdk'],
};

export default nextConfig;
