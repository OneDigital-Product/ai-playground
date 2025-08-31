// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  base: "/app",
  integrations: [react(), mdx()],
  vite: {
    envPrefix: ["VITE_", "PUBLIC_", "NEXT_PUBLIC_"],
  },
});
