import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/enrollment-dashboard",
  transpilePackages: ["@repo/ui", "@repo/backend"],
  async redirects() {
    return isPreview
      ? [
          {
            source: "/",
            destination: "/enrollment-dashboard",
            permanent: false,
          },
        ]
      : [];
  },
};

export default nextConfig;
