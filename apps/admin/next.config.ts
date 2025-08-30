import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/admin",
  async redirects() {
    return isPreview
      ? [
          {
            source: "/",
            destination: "/admin",
            permanent: false,
          },
        ]
      : [];
  },
};

export default nextConfig;
