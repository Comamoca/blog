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
import mdx from "lume/plugins/mdx.ts";
import minify_html from "lume/plugins/minify_html.ts";
import toml from "lume/plugins/toml.ts";
import filter_pages from "lume/plugins/filter_pages.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";

import tailwindOptions from "./tailwind.config.js";

import { createHighlighter } from "npm:shiki";
import {
  AUTHOR,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "./src/consts.ts";

// Remark
import remark from "lume/plugins/remark.ts";
import rehypeShikiFromHighlighter from "npm:@shikijs/rehype/core";
import linkcard from "./plugins/linkcard.ts";

// Shiki theme
import mocha from "npm:@catppuccin/vscode/themes/mocha.json" with {
  type: "json",
};

const RELEASE = Deno.env.get("RELEASE");

const highlighter = await createHighlighter({
  themes: [mocha],
  langs: [
    "js",
    "ts",
    "nix",
    "sh",
    "lua",
    "viml",
    "rust",
    "lisp",
    "yaml",
    "gleam",
  ],
});

const site = lume({
  src: "./src",
});

if (RELEASE) {
  // NOTE: Got error when with use esbuild and pagefind plugin.
  // site.use(esbuild());
  site.use(pagefind());
  site.use(sitemap());
  site.use(minify_html());
  site.use(brotli());
  site.use(gzip());

  site.use(feed({
    output: "api/feed.xml",
    query: "posts",
    info: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      published: new Date(),
      lang: "ja",
      generator: true,
      authorName: AUTHOR,
      authorUrl: SITE_URL,
    },
  }));

  site.use(checkUrls({
    output: "_broken_links.json",
  }));

  site.use(favicon({
    input: "./public/favicon.svg",
  }));

  // site.use(base_path());
  // site.use(toml());
  // site.use(filter_pages());
}

site.use(remark({
  remarkPlugins: RELEASE ? [linkcard] : [],
  rehypePlugins: [
    // [remarkRehype, {
    //   footnoteLabel: "脚注",
    // }],
    [
      rehypeShikiFromHighlighter,
      highlighter,
      {
        themes: { light: "Catppuccin Mocha", dark: "Catppuccin Mocha" },
        inline: "tailing-curly-colon",
      },
    ],
  ],
}));

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
