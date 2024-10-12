// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: "https://banners.li",
  trailingSlash: "never",
  prefetch: true,
  experimental: {
    clientPrerender: true,
    directRenderScript: true,
  },
  integrations: [tailwind({
    applyBaseStyles: false,
  }), sitemap(), react()]
});