// @ts-check
import react from "@astrojs/react";
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [react()],
  env: {
    schema: {
      PUBLIC_CONVEX_URL: envField.string({
        access: "public",
        context: "client",
      }),
    },
  },
});
