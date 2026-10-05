/**
 * 記事Markdownのレンダリング設定。
 *
 * remark段に既存の linkcard、rehype段に既存の shiki (catppuccin-mocha)、
 * 生成後HTML段に既存の footnote.ts 相当の後処理を差し込む。
 *
 * JSプラグインを1つでも設定すると ox-content はRustネイティブパイプラインから
 * unified(remark/rehype)パイプラインへ切り替わる。その結果、脚注のマークアップは
 * remark-gfm互換 (`<section class="footnotes"><h2 id="footnote-label">`) になり、
 * 現行 footnote.ts のセレクタ (`#footnote-label` / `[data-footnote-backref]`) が
 * そのまま適合する。ネイティブパイプライン固有のマークアップ
 * (`<div class="footnote">`) は本設定では使われない。
 */
import { transformMarkdown } from "@ox-content/unplugin";
import linkcard from "./linkcard.ts";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { createHighlighter } from "shiki";

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

// Lume 側は use(plugin, highlighter, opts) の3引数だったが、unified の
// プラグインタプルは [plugin, opts] の2要素なので highlighter を閉じ込める。
function shiki(this: unknown, opts: unknown) {
  return (rehypeShikiFromHighlighter as any).call(this, highlighter, opts);
}

/** 現行 plugins/lume/footnote.ts と同じ置換を生成後HTMLに対して行う */
function footnotePost(html: string): string {
  return html
    .replace(/(<h2[^>]*id="footnote-label"[^>]*?)\sclass="[^"]*"/g, "$1")
    .replace(/(id="footnote-label"[^>]*>)[^<]*/, "$1脚注")
    .replace(/(data-footnote-backref[^>]*>)[^<]*(<\/a>)/g, "$1↩︎$2");
}

// 現行 _config.ts の configureLinkCard() と同じ規約: DISABLE_LINKCARD で
// remarkプラグイン自体を外す (ネットワーク越しのOGP取得を伴うため)。
const DISABLE_LINKCARD = process.env.DISABLE_LINKCARD !== undefined;

export const MD_OPTIONS = {
  gfm: true,
  tables: true,
  taskLists: true,
  strikethrough: true,
  footnotes: true,
  mdx: false,
  toc: false,
  tocMaxDepth: 3,
  highlight: false,
  plugin: {
    oxContent: [footnotePost],
    markdownIt: [],
    mdast: [],
    remark: DISABLE_LINKCARD ? [] : [linkcard],
    rehype: [[
      shiki,
      {
        themes: { light: "catppuccin-mocha", dark: "catppuccin-mocha" },
        inline: "tailing-curly-colon",
      },
    ]],
  },
};

export async function renderMarkdown(
  source: string,
  filePath: string,
): Promise<{ html: string; frontmatter: Record<string, unknown> }> {
  const res = await transformMarkdown(source, filePath, MD_OPTIONS as any);
  return { html: res.html, frontmatter: res.frontmatter as any };
}
