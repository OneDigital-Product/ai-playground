import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/docs",
  async redirects() {
    return isPreview
      ? [
          {
            source: "/",
            destination: "/docs",
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
