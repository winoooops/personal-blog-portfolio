// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

const site = process.env.PUBLIC_SITE_URL || 'https://example.com';
const base = process.env.PUBLIC_BASE_PATH || undefined;

// https://astro.build/config
export default defineConfig({
  site,
  base,

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },

  integrations: [mdx()],
});