import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/app",
  transpilePackages: ["@repo/ui", "@repo/backend"],
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
};

export default nextConfig;
