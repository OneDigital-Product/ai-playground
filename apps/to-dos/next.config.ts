import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/to-dos",
  transpilePackages: ["@repo/ui", "@repo/backend"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/to-dos",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;

