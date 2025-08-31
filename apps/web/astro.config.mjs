// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  base: "/app",
  integrations: [react()],
  vite: {
    envPrefix: ["VITE_", "PUBLIC_", "NEXT_PUBLIC_"],
  },
});
