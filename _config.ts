import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import base_path from "lume/plugins/base_path.ts";
import brotli from "lume/plugins/brotli.ts";
import esbuild from "lume/plugins/esbuild.ts";
import favicon from "lume/plugins/favicon.ts";
import feed from "lume/plugins/feed.ts";
import filter_pages from "lume/plugins/filter_pages.ts";
import mdx from "lume/plugins/mdx.ts";
import minify_html from "lume/plugins/minify_html.ts";
import pagefind from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import toml from "lume/plugins/toml.ts";
import postcss from "lume/plugins/postcss.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";

import tailwindOptions from "./tailwind.config.js";

const site = lume({
  src: "./src",
});

site.use(jsx());
// site.use(feed());
// site.use(mdx());
// site.use(minify_html());
// site.use(pagefind());
// site.use(sitemap());
site.use(tailwindcss({ options: tailwindOptions }));
site.use(postcss());

// site.use(favicon());
// site.use(base_path());
// site.use(toml());
// site.use(filter_pages());
// site.use(brotli());
// site.use(esbuild());

site.ignore(
  "README.md",
  "README.ja.md",
  "src-old",
  "textlint-prh.yml",
  "CHANGELOG.md",
  "node_modules",
);

export default site;
