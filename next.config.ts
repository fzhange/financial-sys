import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/financial-sys',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
