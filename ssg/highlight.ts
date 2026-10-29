/**
 * Shiki ハイライタ生成と rehype ラッパーを markdown / org の両パイプラインで
 * 共有するためのモジュール。テーマ (catppuccin-mocha)・言語リスト・
 * `inline: "tailing-curly-colon"` は現状維持。
 */
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

type ShikiOptions = Parameters<typeof rehypeShikiFromHighlighter>[1];

/**
 * unified の rehype プラグインとして使える、ハイライタを閉じ込めたラッパー。
 * `@shikijs/rehype/core` は (highlighter, options) => transformer を返す関数なので
 * そのままこの highlighter を束縛して返す。
 */
export function shiki(opts: ShikiOptions) {
  return rehypeShikiFromHighlighter(highlighter, opts);
}

export const SHIKI_OPTIONS: ShikiOptions = {
  themes: { light: "catppuccin-mocha", dark: "catppuccin-mocha" },
  inline: "tailing-curly-colon",
  // 既定の 500ms 制限だと、文法の初回 JIT が重い行 (elisp など) で
  // vscode-textmate が行の途中で打ち切り、残りを打ち切り時点のスコープ色で
  // 出力する。負荷次第で同じ入力から別の HTML が出るため無制限にする。
  // 実測では制限を外してもビルド時間は無視できる差だった。
  tokenizeTimeLimit: 0,
};
