# Technology Stack

## Architecture

**Static Site Generator Architecture**:
[ox-content](https://github.com/ubugeeei-prod/ox-content) の custom-host API
(Vite プラグイン) を用いた静的サイト生成。全ルートを `host.ts`
で自前定義する構成で、ox-content 内蔵のブログモード (`/blog/page/{n}/`
等の固定URL) は使わない。詳細な設計判断は
`.kiro/specs/ox-content-migration/design.md` を参照。

## Frontend Technologies

- **Static Site Generator**: ox-content (Rustコア) + Vite+
  (Vite互換ツールチェーン; custom-host)
- **Component Framework**: JSX/TSX。ランタイムは `@ox-content/vite-plugin`
  同梱の文字列SSR用JSXランタイム (`renderToString`)。React/Preact は未使用
- **Styling**: TailwindCSS v4 (`@tailwindcss/vite`) + DaisyUI v5
- **Typography**: Noto Sans CJK / さわらびゴシック for Japanese character
  support
- **Search**: Pagefind継続で実装済み。`ssg/pagefind.ts` が `bun run build`
  の後段 (`ssg/run-pagefind.ts`) でdist以下のHTMLを索引する。UIは
  `src/_components/Search.tsx` + `ssg/pagefind-client.ts`
  (PagefindUIの初期化)。ox-content内蔵BM25は不採用
  (`.kiro/specs/ox-content-migration/design.md` 参照)
- **Language**: TypeScript

## Backend & Build System

- **Runtime**: Node.js (Vite/ox-contentのビルド) + Deno (テストのみ)
- **Build System**: Vite+ (`vite.config.ts`) + `oxContentCustomHost`
  プラグイン。 `vp dev` / `vp build` / `vp preview` を使用する (`vite` は
  vite-plus-core へ alias される)。Oxfmt/Oxlint/Vitest は不採用 (整形は Nix
  treefmt、テストは Deno)。Vite+ は Vite の置き換え (dev/build/preview)
  としてのみ使う
- **ルーティング**: `host.ts` が全ルート (記事・一覧・静的ページ・フィード・
  sitemap・404) を自前定義。記事URLはファイルツリー由来で現行 (旧Lume) と
  完全互換
- **Markdownパイプライン**: `ssg/markdown.ts`。remark段にlinkcard、rehype段に
  shiki (catppuccin-mocha)、生成後HTML段にfootnote後処理を接続
- **静的アセット**: `ssg/static-assets.ts` が `src/img` / `src/public` /
  `src/well-known` を配信 (dev: ミドルウェア直接配信、build: closeBundleで
  コピー)
- **Asset Optimization**: 画像最適化なし。`src/img/` の画像はそのまま配信

## Development Environment

- **Package Manager**: bun (`package.json` /
  `bun.lock`、`devEngines.packageManager` で指定)
- **Task Runner**: bun scripts (`bun run dev` / `bun run build` /
  `bun run preview`) + Deno tasks (`deno.jsonc`、テスト・OG Worker関連のみ)
- **Alternative Tools**: Just commands for blog management workflows
- **Shell Integration**: Nu shell scripts for content creation workflows

## Deployment & Hosting

- **Primary Host**: Cloudflare Pages
- **Domain**: `comamoca.dev`
- **Build Environment**: `.github/workflows/deploy.yaml` (mainへのpushで発火)
- **CDN**: Cloudflare's global CDN network

## Common Development Commands

### Core Development

```bash
# Development server with hot reload
bun run dev

# Production build
bun run build

# ビルド + Cloudflare Pages へのデプロイ
bun run build
wrangler pages deploy ./dist --project-name=blog

# フォントダウンロード (OG Worker のフォントサブセット素材用)
deno task download-fonts
```

### Content Management (with Just)

```bash
# Open blog posts for editing (requires nu shell and fzf)
just open

# Create new diary entry
just diary

# Create new blog post
just new

# Edit existing diary entries
just edit-diary

# Open latest diary entry
just latest-diary
```

### Testing

```bash
# 全テスト (Deno)
deno task test

# URL/フィード互換性テストのみ (要ビルド済みdist/)
BUILD_OUTPUT_DIR=dist deno test --allow-all tests/url_compat_test.ts tests/feed_compat_test.ts
```

### Development Tools

```bash
# Format code with Nix
nix fmt

# Enter development shell
nix develop
# CIと同じ最小devShell (npm/deno/wranglerのみ)
nix develop .#ci
```

## Configuration Files

- **Primary Config**: `vite.config.ts` - Vite+ + ox-content custom-host 設定
- **Routing**: `host.ts` - 全ルート定義
- **Node Config**: `package.json` - bun scripts と依存関係
- **Deno Config**: `deno.jsonc` - テスト実行と `date-fns` importのみ
- **Development Nix**: `flake.nix` - Nix development environment

## Plugin Architecture

`ssg/` ディレクトリに移行済みの機能を集約している。

- **Markdown設定**: `ssg/markdown.ts` - remark/rehype/HTML後処理プラグインの
  組み立て
- **Link Cards**: `ssg/linkcard.ts` + `ssg/fetchogp.ts` - 外部リンクの
  OGPカード生成 (Node移植版。`linkedom` でHTML解析)
- **OGPメタタグ**: `ssg/og_metas.ts` - og.comamoca.dev への画像URL生成
- **フィード**: `ssg/feed.ts` - RSS/JSON Feed生成、git履歴からの日付合成
- **一覧・静的ページ**: `ssg/pages/*.tsx` - 一覧/静的ページの表示コンポーネント

## Performance Optimizations

- **開発時反映速度**: リクエスト時レンダリング (Vite dev middleware) による
  O(1)特性。記事数に依存せず編集→反映が実測0.5秒程度 (旧Lumeは記事447本で
  約29秒、暫定対応後でも4.5秒)
- **Image Processing**: None; images are served as-is from `src/img/`
- **Static Generation**: Pre-built HTML for optimal loading performance

## Security Considerations

- **Static Site**: No server-side vulnerabilities
- **Content Security**: Markdown processing with safe rendering
- **Deployment Security**: Cloudflare's security features and SSL/TLS

## Development Workflow

1. **Content Creation**: Markdown files with frontmatter (`src/blog/`)
2. **Component Development**: TSX files with 同期 function exports
   (ox-contentのJSXランタイムは同期のみ。`async` コンポーネントは無言で
   空文字列になる点に注意)
3. **Local Development**: `bun run dev` でVite dev serverを起動
4. **Production Build**: `bun run build`
5. **Deployment**: `.github/workflows/deploy.yaml` 経由でCloudflare Pagesへ

## Dependencies Management

- **Runtime Dependencies**: `package.json` / `bun.lock` (bun)
- **Deno側**: `deno.jsonc` はテスト実行と `date-fns` importのみを管理
- **Version Control**: `@ox-content/*` パッケージはバージョン固定
  (v3.2.6で検証済み)
