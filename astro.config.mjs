// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
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
  integrations: [react(), sitemap()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Noto Sans",
      cssVariable: "--font-noto-sans",
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
