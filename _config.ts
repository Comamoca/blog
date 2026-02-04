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
import nano from "npm:cssnano";
import checkUrls from "lume/plugins/check_urls.ts";
import mdx from "lume/plugins/mdx.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import openGraphImages from "lume/plugins/og_images.ts";
import extractDate from "lume/plugins/extract_date.ts";
import metas from "lume/plugins/metas.ts";
// import toml from "lume/plugins/toml.ts";
// import filter_pages from "lume/plugins/filter_pages.ts";
// import base_path from "lume/plugins/base_path.ts";
// import esbuild from "lume/plugins/esbuild.ts";
import transformImages from "lume/plugins/transform_images.ts";
import picture from "lume/plugins/picture.ts";
import { is } from "jsr:@core/unknownutil";
import { readFile } from "node:fs/promises";
import { basename } from "jsr:@std/path";
import { expandGlob } from "jsr:@std/fs";
import { groupBy } from "jsr:@es-toolkit/es-toolkit";
import { format } from "date-fns";

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
import rehypeSlug from "npm:rehype-slug";
import rehypeAutolinkHeadings from "npm:rehype-autolink-headings";
import linkcard from "./plugins/linkcard.ts";
// import metas from "./plugins/metas.ts";

// Lume plugin
import footnote from "./plugins/lume/footnote.ts";

// For RSS lastBuildDate
// TODO: 同日に複数の記事が投稿された場合にも対応する
async function getLatestPostDate() {
  const globPost = "./src/blog/*.md";

  const entries = await Array.fromAsync(expandGlob(globPost));
  const articleDate = entries.map((entry) => basename(entry.path))
    .map((name) => name.slice(0, 10));
  const sorted = entries.map((entry) => basename(entry.path))
    .map((name) => name.slice(0, 10))
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => -(a.getTime()) - (b.getTime()));

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");

  const grouped = groupBy(articleDate, (item) => item);
  const todayPost = grouped[today];

  if (!is.Undefined(todayPost) && todayPost.length > 1) {
    return new Date();
  } else {
    return sorted[0];
  }
}

const RELEASE = Deno.env.get("RELEASE");
const DISABLE_LINKCARD = Deno.env.get("DISABLE_LINKCARD");

// Link card configuration interface
interface LinkCardConfig {
  enabled?: boolean;
  debugMode?: boolean;
  developmentMode?: boolean;
}

// Enhanced link card configuration
function configureLinkCard(linkCardConfig?: LinkCardConfig): any[] {
  const isDisabledByEnv = DISABLE_LINKCARD !== undefined;
  const isDisabledByConfig = linkCardConfig?.enabled === false;

  // Environment variables take precedence for backwards compatibility
  if (isDisabledByEnv) {
    return []; // disabled
  }

  // Check config object
  if (isDisabledByConfig) {
    return []; // disabled
  }

  // Enable by default or when explicitly enabled
  const debugMode = linkCardConfig?.debugMode || false;
  const configToPass = { debugMode };

  return [linkcard];
}

// Configure linkcard - enable by default in both dev and production
const linkCardPlugins = configureLinkCard();

const highlighter = await createHighlighter({
  themes: ["catppuccin-mocha"],
  langs: [
    "v",
    "js",
    "ts",
    "nix",
    "py",
    "sh",
    "lua",
    "html",
    "viml",
    "rust",
    "lisp",
    "yaml",
    "scala",
    "elisp",
    "gleam",
    "clojure",
    "ssh-config",
  ],
});

const site = lume({
  src: "./src",
  location: new URL("https://comamoca.dev"),
});

if (RELEASE) {
  // NOTE: Got error when with use esbuild and pagefind plugin.
  // site.use(esbuild());
  site.use(sitemap());
  site.use(brotli());
  site.use(gzip());

  site.use(checkUrls({
    output: "_broken_links.json",
  }));

  site.use(favicon({
    input: "./public/favicon.svg",
  }));

  site.use(openGraphImages({
    options: {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: "NotoSansJP Regular",
          data: await readFile("./fonts/noto-fonts/NotoSansCJKjp-Regular.otf"),
          weight: 400,
          style: "normal",
        },
        {
          name: "NotoSansJP Bold",
          data: await readFile("./fonts/noto-fonts/NotoSansCJKjp-Bold.otf"),
          weight: 700,
          style: "normal",
        },
      ],
    },
  }));
}

// RSS feed - enabled in both dev and production modes
site.use(feed({
  output: ["api/feed.xml", "api/feed.json"],
  query: "posts",
  info: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    lang: "ja",
    generator: true,
    authorName: AUTHOR,
    authorUrl: SITE_URL,
    published: await getLatestPostDate(),
  },
  items: {
    title: "=title",
    description: "=extract",
    published: "=date",
    updated: undefined,
    content: "=content",
    authorName: AUTHOR,
    authorUrl: `${SITE_URL}/me`,
    image: "=cover",
  },
}));

site.use(remark({
  remarkPlugins: linkCardPlugins,
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "prepend",
        properties: {
          className: ["anchor-link"],
          ariaLabel: "このセクションへのリンク",
        },
        content: {
          type: "element",
          tagName: "span",
          properties: { className: ["anchor-icon"] },
          children: [{ type: "text", value: "#" }],
        },
      },
    ],
    [
      rehypeShikiFromHighlighter,
      highlighter,
      {
        themes: { light: "catppuccin-mocha", dark: "catppuccin-mocha" },
        inline: "tailing-curly-colon",
      },
    ],
  ],
}));

site.use(jsx());
site.use(mdx());

site.use(footnote());
site.use(tailwindcss());
site.use(postcss());

// Add stylesheet for tailwindcss
site.add("style.css");

site.add([".png"]);

site.copy("./public");
site.copy("./well-known", ".well-known");

// Always enable pagefind for search functionality
site.use(pagefind({
  indexing: {
    excludeSelectors: [
      "[data-pagefind-ignore]",
    ],
    rootSelector: "main",
  },
  ui: {
    showImages: false,
    excerptLength: 30,
  },
}));

if (RELEASE) {
  site.hooks.addPostcssPlugin(nano);
  site.use(minifyHTML());
}

site.use(picture());
site.use(transformImages());
site.add("img");
site.use(metas());
site.use(extractDate({ remove: false }));

site.ignore(
  "README.md",
  "README.ja.md",
  "textlint-prh.yml",
  "CHANGELOG.md",
  "node_modules",
);

export default site;
