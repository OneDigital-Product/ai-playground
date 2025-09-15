import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/stewardship",
  transpilePackages: ["@repo/ui", "@repo/backend"],
  async redirects() {
    return isPreview
      ? [
          {
            source: "/",
            destination: "/stewardship",
            permanent: false,
            basePath: false,
          },
        ]
      : [];
  },
};

export default nextConfig;
