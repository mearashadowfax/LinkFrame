// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://link-frame.vercel.app/",
  trailingSlash: "never",
  prefetch: true,
  experimental: {
    clientPrerender: true,
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
