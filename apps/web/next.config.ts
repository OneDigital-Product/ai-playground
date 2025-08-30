import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/app",
  async redirects() {
    return isPreview
      ? [
          {
            source: "/",
            destination: "/app",
            permanent: false,
          },
        ]
      : [];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
