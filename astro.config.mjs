import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: change `site` to your real domain once you have one.
// It powers the sitemap, canonical URLs and Open Graph tags.
export default defineConfig({
  site: 'https://thre4dripper.github.io',
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    // Single-page site with ~12KB of CSS — inlining it removes a
    // render-blocking request and improves FCP/LCP.
    inlineStylesheets: 'always',
  },
});
