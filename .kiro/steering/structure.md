# Project Structure

## Root Directory Organization

```
/
├── src/                    # コンテンツ・コンポーネント・レイアウト
├── ssg/                    # ox-content用ビルドロジック (ルート定義以外)
├── host.ts                 # 全ルート定義 (custom-host)
├── vite.config.ts          # Vite + ox-content custom-host 設定
├── utils/                  # 共有ユーティリティ (paginate.tsのみ)
├── scripts/                # OG Worker用フォントダウンロード等
├── tests/                  # テスト (Deno)
├── tools/                  # 移行補助スクリプト
├── og/                     # OG画像生成Worker (Gleam, 別デプロイ対象)
├── package.json            # npm依存関係とスクリプト
├── deno.jsonc              # Deno設定 (テスト実行用)
├── justfile                # Just command definitions
└── flake.nix               # Nix development environment
```

## Routing Model

ページファイル命名規則 (`*.page.tsx`) は使わない。全ルートを `host.ts` の
`routes()` が動的に構築する。

```ts
// host.ts (抜粋)
export const host = {
  async routes(ctx) {
    // 記事: src/blog/*.md を読んでルートを生成
    // 一覧: /all/{n}/ /tech/{n}/ /diary/{n}/
    // 静的: /me.html /info.html /hub.html
    // フィード: /api/feed.xml /api/feed.json
    // sitemap.xml, 404.html
    return [...];
  },
  notFound() { ... },
};
```

新しいURLを追加する場合は `host.ts` にルートを足す。URL互換性は
`tests/fixtures/urls.txt` との照合テスト (`tests/url_compat_test.ts`) で
担保している。

## Source Directory Structure (`src/`)

### Component Organization

```
src/
├── _components/           # 再利用可能なTSXコンポーネント (同期関数)
│   ├── Header.tsx        # サイトヘッダー・ナビゲーション
│   ├── Footer.tsx        # フッター
│   ├── PostList.tsx      # 記事一覧
│   ├── PostCard.tsx      # 記事カード
│   ├── Search.tsx        # 検索UI (現状は検索機能自体が未実装)
│   ├── Logo.tsx          # サイトロゴ
│   └── Twemoji.tsx       # 絵文字表示
```

### Layout Templates

```
src/_includes/layouts/
├── main.tsx              # 一覧・静的ページ用レイアウト
└── post.tsx              # 記事ページ用レイアウト
```

両レイアウトとも `style.css` をESM importしており、`ssrStylesheets`
(vite.config.ts) がハッシュ付きCSSファイルへの `<link>` を生成する。

### Content Organization

```
src/
├── blog/                 # 記事Markdown
│   ├── YYYY-MM-DD-title.md           # 通常記事
│   └── YYYY-MM-DD-diary.md           # 日報
└── img/                  # 画像アセット (ssg/static-assets.tsが配信)
```

### Shared Code

```
src/
├── consts.ts              # サイト定数 (SITE_TITLE等)
├── style.css               # Tailwind v4 エントリ (@plugin/@theme/@apply含む)
├── public/                 # favicon.svg / icon.png (サイトルート直下に展開)
└── well-known/              # nostr.json 等 (/.well-known/ 配下に展開)
```

## `ssg/` Directory Structure

Lumeプラグインの移植先。ox-content固有のビルドロジックをここに集約する。

```
ssg/
├── markdown.ts            # remark/rehype/HTML後処理プラグインの組み立て
├── linkcard.ts             # 外部リンクカード生成 (remarkプラグイン)
├── fetchogp.ts              # OGP情報取得 (linkedomでHTML解析、ファイル
│                             キャッシュ)
├── og_metas.ts              # og.comamoca.dev 向け画像URL生成
├── feed.ts                   # RSS/JSON Feed生成、git履歴からの日付合成
├── static-assets.ts          # img/public/well-known の配信
└── pages/                     # 一覧・静的ページの表示コンポーネント
    ├── HomePage.tsx
    ├── AllPage.tsx            # ページ送りUIが独自 (前へ/後へ + 番号)
    ├── TechPage.tsx            # ページ送りUIが独自 (番号のみ)
    ├── DiaryPage.tsx            # ページ送りUIが独自 (前後1件ずつ)
    ├── MePage.tsx
    ├── InfoPage.tsx
    ├── HubPage.tsx
    ├── NotFoundPage.tsx
    └── types.ts                 # PostSummary / PageLink / Pagination 型
```

## Utility and Script Organization

### Utilities (`utils/`)

```
utils/
└── paginate.ts            # buildPageLinks() - ページ送りリンク生成
                            # (host.tsとssg/pages/*.tsxで共有)
```

### Scripts (`scripts/`)

```
scripts/
├── downloadFonts.ts       # OG Worker用フォントサブセット素材のダウンロード
└── extractTags.ts         # 記事frontmatterからタグ抽出
```

## File Naming Conventions

### Component Files

- **Components**: PascalCase TSX files (e.g., `PostCard.tsx`)
- **Layouts**: `src/_includes/layouts/` 配下のkebab-case TSXファイル
- **ページ表示コンポーネント**: `ssg/pages/` 配下のPascalCase TSXファイル
  (`*Page.tsx` サフィックス)

### Content Files

- **Blog Posts**: `YYYY-MM-DD-title.md` format
- **Diary Entries**: `YYYY-MM-DD-diary.md` format

## Key Architectural Principles

### Component Architecture

- **同期コンポーネント**: ox-contentのJSXランタイム (`renderToString`) は
  同期のみ対応。`async` 関数コンポーネントはPromiseが無言で破棄され空文字列
  になるため使わない
- **Single Responsibility**: Each component handles one specific UI concern
- **Composition**: `renderToString()` + `raw()` でネストしたコンポーネントを
  文字列合成する (host.ts参照)

### Content Architecture

- **Markdown-First**: Content authored in Markdown with frontmatter
- **Date-Based Organization**: Posts organized chronologically by filename
- **frontmatter読み込み**: `@ox-content/napi` の `prepareSource()` で
  メタデータのみ高速に読む (host.ts)

### Build Architecture

- **リクエスト時レンダリング**: dev時は該当ルートのみをリクエスト時に
  レンダリングするO(1)特性 (旧LumeはO(n)で記事数に比例して遅化した)
- **dependencies宣言必須**: 各ルートは `dependencies` (ファイル/ディレクトリ)
  を宣言する必要がある。宣言が無いとdevサーバーが応答をキャッシュし続け、
  ファイルを編集しても反映されない

### Testing Architecture

- **URL/フィード互換性テスト**: `tests/url_compat_test.ts` /
  `tests/feed_compat_test.ts` が `tests/fixtures/` のスナップショットと
  ビルド出力 (`BUILD_OUTPUT_DIR` 環境変数で指定) を照合する
- **純粋関数の単体テスト**: `ssg/*.ts` の日付ロジック・OGP URL生成ロジックは
  `tests/ssg_feed_test.ts` / `tests/ssg_og_metas_test.ts` で直接検証する

## Data Flow Patterns

### Content Processing

1. **Markdown Files** (`src/blog/*.md`) → `host.ts` がfrontmatterを読み
   ルート一覧を構築
2. **リクエスト/ビルド時** → `ssg/markdown.ts` の `transformMarkdown` で
   Markdown→HTML変換 (remark/rehypeプラグイン適用)
3. **JSXレンダリング** → `renderToString()` でレイアウト・ページ
   コンポーネントを文字列化
4. **静的アセット** → `ssg/static-assets.ts` がdev/build両方で配信

### Search Integration

未実装。README.mdのTodoに記載の既存課題。Pagefind継続かox-content内蔵
BM25検索かを比較検討中 (詳細は `.kiro/specs/ox-content-migration/`)。

This structure supports efficient development, content management, and
deployment while maintaining clear separation of concerns and scalability for
future growth.
