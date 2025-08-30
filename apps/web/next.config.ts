import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/app",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
