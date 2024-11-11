import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import brotli from "lume/plugins/brotli.ts";
import gzip from "lume/plugins/gzip.ts";
import favicon from "lume/plugins/favicon.ts";
import feed from "lume/plugins/feed.ts";
import pagefind from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import postcss from "lume/plugins/postcss.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import checkUrls from "lume/plugins/check_urls.ts";
import toml from "lume/plugins/toml.ts";
import filter_pages from "lume/plugins/filter_pages.ts";
import mdx from "lume/plugins/mdx.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import minify_html from "lume/plugins/minify_html.ts";
import anchor from "npm:markdown-it-anchor";
import footnote from "npm:markdown-it-footnote";

import shiki from "https://deno.land/x/lume_shiki@0.0.16/mod.ts";
import mocha from "npm:@catppuccin/vscode/themes/mocha.json" with {
  type: "json",
};

import tailwindOptions from "./tailwind.config.js";

const RELEASE = Deno.env.get("RELEASE");

const markdown = {
  plugins: [
    [anchor, { level: 2 }],
    footnote,
  ],
};

const site = lume({
  src: "./src",
  location: new URL("https://comamoca.dev"),
}, { markdown });

if (RELEASE) {
  // NOTE: Got error when with use esbuild and pagefind plugin.
  // site.use(esbuild());
  site.use(pagefind());
  site.use(sitemap());
  site.use(minify_html());
  site.use(brotli());
  site.use(gzip());

  // site.use(base_path());
  // site.use(toml());
  // site.use(filter_pages());
}

site.use(jsx());
site.use(mdx());
site.use(tailwindcss({ options: tailwindOptions }));
site.use(postcss());

site.ignore(
  "README.md",
  "README.ja.md",
  "src-old",
  "content/blog",
  "textlint-prh.yml",
  "CHANGELOG.md",
  "node_modules",
);

site.copy("./public", ".");

export default site;
