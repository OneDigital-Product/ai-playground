import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/enrollment-dashboard",
  transpilePackages: ["@repo/ui", "@repo/backend"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/enrollment-dashboard",
        permanent: false,
        // Ensure this redirect applies at the domain root, not under basePath
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
