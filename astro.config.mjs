import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import rlc from "remark-link-card";

import tailwind from "@astrojs/tailwind";
import { remarkReadingTime } from "./src/utils";

export default defineConfig({
  site: "https://comamoca.dev",
  integrations: [
    mdx({
      remarkPlugins: [remarkReadingTime],
    }),
    sitemap(),
    react(),
    tailwind(),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime, rlc],
    shikiConfig: {
      theme: "solarized-light",
      wrap: false,
    },
  },
});
