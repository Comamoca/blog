import { defineConfig } from "vite";
import { oxContentCustomHost } from "@ox-content/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { staticAssets } from "./ssg/static-assets.ts";

export default defineConfig({
  // ox-content 同梱の文字列SSR用JSXランタイムを使う (React/Preact不要)。
  esbuild: { jsx: "automatic", jsxImportSource: "@ox-content/vite-plugin" },
  server: {
    watch: {
      // .direnv/flake-inputs は nix flake input への symlink で、辿ると
      // nixpkgs 全体のような巨大なソースツリーに繋がる。監視対象に入ると
      // ENOSPC (file watcher upper limit) でdevサーバーが落ちるため除外する。
      ignored: ["**/.direnv/**", "**/.git/**", "**/dist/**"],
    },
  },
  plugins: [
    tailwindcss(),
    oxContentCustomHost({
      host: "./host.ts",
      oxContent: {
        srcDir: "src",
        outDir: "dist",
        // 検索はPagefind続投で決定 (task 7.1)。ox-content内蔵のBM25は
        // custom-hostに配線されておらず(他フレームワーク外からの利用も非推奨)、
        // 索引もコーパス全体を1回のリクエストで読む設計なため不採用。
        // 無効化しておかないとルートごとに再構築が走り474ルートで大幅に
        // 遅くなる。
        search: false,
        // JSDoc由来のAPIドキュメント生成はこのブログでは不要
        docs: false,
      },
      dev: {
        // 記事の追加・削除・frontmatter変更でルート一覧を作り直す
        routeDependencies: [{ path: "src/blog", kind: "directory" }],
      },
      build: {
        // Vite の transformIndexHtml をルートごとに呼ぶと474ルートで数十秒かかる。
        // アセット注入 (CSSリンク等) はこちらの render() 側で完結しているため
        // 不要で、切ってビルド時間を短縮する。
        transformHtml: false,
      },
      // レイアウトが import した CSS (style.css) を本番成果物として書き出す
      ssrStylesheets: { modules: ["/src/_includes/layouts/post.tsx"] },
    }),
    staticAssets(),
  ],
});
