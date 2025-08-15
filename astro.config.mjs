// @ts-check
import react from "@astrojs/react";
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: false,
    },
    speedInsights: {
      enabled: false,
    },
    functionPerRoute: false,
  }),
  integrations: [react()],
  env: {
    schema: {
      PUBLIC_CONVEX_URL: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
});
