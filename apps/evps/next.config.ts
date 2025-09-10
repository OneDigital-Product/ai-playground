import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  basePath: "/evps",
  transpilePackages: ["@repo/ui", "@repo/backend"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/evps",
        permanent: false,
        // Ensure this redirect applies at the domain root, not under basePath
        basePath: false,
      },
    ];
  },
};

export default nextConfig;