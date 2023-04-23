import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";
import { remarkReadingTime } from "./src/utils";

export default defineConfig({
  site: "https://comamoca.pages.dev",
  integrations: [
    mdx({ remarkPlugins: [remarkReadingTime] }),
    sitemap(),
    react(),
    tailwind(),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      theme: "solarized-light",
      wrap: false,
    },
  },
});
