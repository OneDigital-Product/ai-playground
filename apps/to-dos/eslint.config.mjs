import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      // Project uses strict TypeScript; keep defaults consistent with monorepo
    },
  },
];

