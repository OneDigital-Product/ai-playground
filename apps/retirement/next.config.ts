import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/retirement",
  transpilePackages: ["@repo/ui", "@repo/backend"],
  async redirects() {
    return isPreview
      ? [
          {
            source: "/",
            destination: "/retirement",
            permanent: false,
          },
        ]
      : [];
  },
};

export default nextConfig;
