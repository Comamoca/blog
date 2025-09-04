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
import typography from "npm:@tailwindcss/typography";
import daisyui from "npm:daisyui@4.5.0";
import nano from "npm:cssnano";
import checkUrls from "lume/plugins/check_urls.ts";
import mdx from "lume/plugins/mdx.ts";
import minify_html from "lume/plugins/minify_html.ts";
import { ogImages } from "lume/plugins/og_images.ts";
import metas from "lume/plugins/metas.ts";
import { read } from "lume/core/utils/read.ts";
import toml from "lume/plugins/toml.ts";
import filter_pages from "lume/plugins/filter_pages.ts";
import base_path from "lume/plugins/base_path.ts";
import esbuild from "lume/plugins/esbuild.ts";
import transformImages from "lume/plugins/transform_images.ts";
import picture from "lume/plugins/picture.ts";

// import tailwindOptions from "./tailwind.config.js";

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

// Lume plugin
import footnote from "./plugins/lume/footnote.ts";

const RELEASE = Deno.env.get("RELEASE");

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

const tailwindOptions = {
  content: [
    "./src/**/*.{astro,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./_site/**/*.html",
  ],
  safelist: [
    "grid-cols-2",
    "gap-2",
    "p-3",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "code": {
              "border-radius": "0.25rem",
              "background-color": "rgb(226 232 240)",
              "padding-left": "0.25rem",
              "padding-right": "0.25rem",
              "padding-top": "0.125rem",
              "padding-bottom": "0.125rem",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
          },
        },
      }),
    },
  },
  // plugins: [typography, daisyui],
  plugins: [typography, daisyui],
};

const site = lume({
  src: "./src",
  location: new URL("https://comamoca.dev"),
});

if (RELEASE) {
  // NOTE: Got error when with use esbuild and pagefind plugin.
  // site.use(esbuild());
  site.use(sitemap());
  site.use(minify_html());
  site.use(brotli());
  site.use(gzip());

  site.use(feed({
    output: ["api/feed.xml", "api/feed.json"],
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

  site.use(ogImages({
    cache: true,
    satori: {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: "NotoSansJPBlack",
          weight: 900,
          style: "normal",
          data: await read("./fonts/noto-fonts/NotoSansCJKjp-Black.otf", true),
        },
        {
          name: "NotoSansJPBold",
          weight: 800,
          style: "normal",
          data: await read("./fonts/noto-fonts/NotoSansCJKjp-Bold.otf", true),
        },
        {
          name: "NotoSansJP",
          weight: 600,
          style: "normal",
          data: await read(
            "./fonts/noto-fonts/NotoSansCJKjp-Regular.otf",
            true,
          ),
        },
      ],
    },
  }));

  // site.use(base_path());
  // site.use(toml());
  // site.use(filter_pages());
}

site.use(metas());
site.use(remark({
  remarkPlugins: RELEASE ? [linkcard] : [],
  rehypePlugins: [
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
site.use(tailwindcss({ options: tailwindOptions }));
site.use(postcss());

site.loadAssets([".png"]);

// site.copy("/img")
site.copy("./public");
site.copy("./well-known", ".well-known");

if (RELEASE) {
  site.hooks.addPostcssPlugin(nano);
  site.use(pagefind());
  site.use(picture());
  site.use(transformImages({
    cache: false,
  }));
} else {
  site.use(picture());
  site.use(transformImages());
}

site.ignore(
  "README.md",
  "README.ja.md",
  "textlint-prh.yml",
  "CHANGELOG.md",
  "node_modules",
);

export default site;
