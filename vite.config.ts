import { defineConfig, lazyPlugins } from "vite-plus";
import { oxContentCustomHost } from "@ox-content/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { staticAssets } from "./ssg/static-assets.ts";

export default defineConfig({
  // Oxfmt/Oxlint (vp check) は採用しない。整形は Nix treefmt、テストは deno test を
  // 使うため。Vite+ は Vite の置き換え (dev/build/preview) としてのみ使う。
  // ox-content 同梱の文字列SSR用JSXランタイムを使う (React/Preact不要)。
  // Vite 8 では transform を Oxc が担うため oxc に指定する。esbuild を
  // 併記すると oxc 側が優先され「esbuild は無視される」警告が出る。
  oxc: {
    jsx: { runtime: "automatic", importSource: "@ox-content/vite-plugin" },
  },
  // テストは Deno (`deno task test`) を使う。Vitest (vp test) にはこの
  // リポジトリ向けのテストが無いため、Deno テスト (tests/**) と nix flake
  // input のシンボリックフォレスト (.direnv/**) を探索せず 0 件でも成功させる。
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.direnv/**",
      "tests/**",
      "og/**",
    ],
    passWithNoTests: true,
  },
  server: {
    watch: {
      // .direnv/flake-inputs は nix flake input への symlink で、辿ると
      // nixpkgs 全体のような巨大なソースツリーに繋がる。監視対象に入ると
      // ENOSPC (file watcher upper limit) でdevサーバーが落ちるため除外する。
      ignored: ["**/.direnv/**", "**/.git/**", "**/dist/**"],
    },
  },
  plugins: lazyPlugins(() => [
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
  ]),
});
