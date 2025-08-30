import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/docs",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
