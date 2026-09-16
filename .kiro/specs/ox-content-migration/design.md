# テクニカルデザイン文書

## 概要

Lume v3 から ox-content (v3.2.6) へ静的サイト生成基盤を移行する。ox-content の
内蔵ブログモードは使わず、**custom-host API
で全ルートを自前定義する**構成を採る。
これによりURL生成をこちらが完全に制御でき、URL互換性が設計上保証される。

Markdown のレンダリングは `@ox-content/unplugin` の `transformMarkdown()` を
ルートの `render()` から呼び出す。この関数は remark / rehype / mdast /
markdown-it / HTML後処理の5段のプラグインフックを持ち、既存資産をそのまま受け
入れられる。

### ゴール

- 公開472URLの完全維持
- 編集→プレビュー反映を1秒以内、かつ記事数に依存しない O(1) 特性の獲得
- 既存の remark/rehype プラグイン・TSXコンポーネント・`style.css` の継続利用
- RSS/JSONフィードの互換維持

### 対象外

- **Org ファイルの取り扱い** — uniorg による Org 移行は本移行の完了後に別仕様で
  実施する。本設計では「後から差し込める構造」であることのみを保証する
- 記事本文の内容変更
- デザインの刷新
- OG画像生成方式の変更 (og.comamoca.dev への委譲を維持)

## 検証済みの事実

本設計は全447記事を投入した実機PoCに基づく。以下は実測値である。

| 検証項目                                        | 結果                                |
| ----------------------------------------------- | ----------------------------------- |
| URL互換性 (本番sitemap 472件との照合)           | 472/472一致・余剰0                  |
| 既存 remark プラグイン (linkcard)               | 動作。162記事で生成 (移行前と同数)  |
| 既存 rehype プラグイン (shiki catppuccin-mocha) | 動作。40記事                        |
| `footnote.ts` のセレクタ                        | 変更不要。74記事で置換成功          |
| Tailwind v4 + DaisyUI + typography              | `style.css` 無改造で動作。CSS 192KB |
| HTML内95クラスの網羅性                          | Tailwind由来の欠落ゼロ              |
| RSS の title/link/pubDate                       | 10/10一致                           |
| JSON Feed の id/title/date_published            | 10/10一致                           |
| `@ox-content/napi` の NixOS 動作                | patchelf不要でそのまま動作          |
| uniorg の HTML 出力                             | 動作確認済 (将来のorg移行の接続性)  |

### 性能実測

| 指標             | Lume (PR#41後) | ox-content (全機能込み) |
| ---------------- | -------------- | ----------------------- |
| 編集→反映        | 4.5s           | **0.22s**               |
| dev サーバー起動 | 20.5s          | **0.42s**               |
| フルビルド       | 22.8s          | **5.6s**                |

Lume は1ファイル保存のたびに全ページを再レンダリングする (書き込みのみスキップ)
のに対し、ox-content は Vite のミドルウェアがリクエストされたページのみを
レンダリングするため、記事数が増えても反映時間は一定である。

## アーキテクチャ

### 既存アーキテクチャ分析

現行 Lume の URL 生成は以下に分散している。

- `src/blog/_data.js` の `url()` — 記事URLを `pubDate` + ファイル名から生成
- `src/all.page.tsx` / `tech.page.tsx` / `diary.page.tsx` — `paginate()` の
  `url` オプション
- 各 `*.page.tsx` の `export const url`
- `feed` プラグインの `output` オプション

全447記事について「ファイル名の日付 == frontmatter の `pubDate` の日付」が
成立していることを確認済み (不一致0件)。したがって記事URLは実質的に
`/blog/{ファイル名のstem}/` と等価であり、これは ox-content のファイルツリー
由来のルーティング既定と一致する。

### 高レベルアーキテクチャ

```
vite.config.ts
 ├── @tailwindcss/vite            … style.css を処理
 └── oxContentCustomHost
      ├── host: "./host.ts"
      └── ssrStylesheets: { modules: ["/src/_includes/layouts/post.tsx"] }

host.ts  (全ルートの定義)
 ├── routes(ctx)  … 472ルートを返す
 │    ├── 記事      /blog/{stem}/          → transformMarkdown → PostLayout
 │    ├── 一覧      /all|tech|diary/{n}/   → ListLayout
 │    ├── 静的      /me.html 他             → 各レイアウト
 │    └── フィード  /api/feed.{xml,json}    → feed.ts
 └── notFound()   … /404.html
```

### 技術適合性

| 領域         | 採用                                            | 理由                                                                                              |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ルーティング | custom-host                                     | `path` を自前指定できURL互換が設計上保証される。内蔵ブログモードは `/blog/page/{n}/` 固定で非互換 |
| Markdown     | `@ox-content/unplugin` の `transformMarkdown()` | remark/rehype の5段フックを持ち既存資産を無改造で受け入れる                                       |
| JSX          | `@ox-content/vite-plugin/jsx-runtime`           | 同梱のため追加依存ゼロ。文字列SSR専用で用途に過不足がない                                         |
| CSS          | `@tailwindcss/vite`                             | Tailwind v4 の CSS-first 設定をそのまま解釈する                                                   |

## コンポーネント設計

### ルート定義 (`host.ts`)

custom-host のモジュール契約は以下のとおり。

```ts
export const host = {
  routes: (ctx) => Route[],   // path を任意に指定できる
  outputs?: (ctx) => ...,     // ビルド時のみ呼ばれる協調出力
  notFound?: (ctx) => ...,    // 404
};
```

`Route` は `path` / `render()` / `dependencies` / `aliases` / `redirect` を
持つ。`render()` は HTML 文字列でも `Response` でも返せるため、フィードのような
非HTMLも同じ仕組みで出力できる。

### 開発時の依存関係宣言 (必須)

**ルートに `dependencies` を宣言しないと、開発サーバーが応答をキャッシュし続け、
ファイルを編集しても一切反映されない。** PoCで最初に踏んだ問題であり、エラーには
ならず単に古い内容が返るため気付きにくい。

```ts
// 記事: 自分のソースファイル
{ path: p.url, dependencies: [{ path: p.file, kind: "file" }], render }

// 一覧・フィード: blogディレクトリ全体
{ path: "/all/3/", dependencies: [{ path: "content/blog", kind: "directory" }], render }
```

加えて、記事の追加・削除でルート一覧自体を作り直すため `dev.routeDependencies`
にディレクトリを指定する。

### Markdown パイプライン

```ts
const MD_OPTIONS = {
  gfm: true, tables: true, taskLists: true, strikethrough: true, footnotes: true,
  plugin: {
    remark:    [linkcard],                    // mdast段
    rehype:    [[shiki, { themes: {...} }]],  // hast段
    oxContent: [footnotePost],                // 生成後HTML段
    mdast: [], markdownIt: [],
  },
};
const res = await transformMarkdown(source, filePath, MD_OPTIONS);
```

**注意点が2つある。**

1. **JSプラグインを設定するとRustネイティブから unified パイプラインへ
   切り替わる。** 実測で 0.07ms/記事 → 1.64ms/記事 (23倍)。ただし447記事でも
   合計0.73秒であり実害はない。
2. **脚注のマークアップがパイプラインによって変わる。** ネイティブは
   `<div id="fn-1" class="footnote">` 系、unified は remark/GFM 互換の
   `<section class="footnotes"><h2 id="footnote-label">` 系を出力する。 linkcard
   を使う以上 unified 側に乗るため、既存 `footnote.ts` のセレクタが
   そのまま適合する。

shiki は Lume では `use(plugin, highlighter, opts)` の3引数で渡していたが、
unified のタプルは `[plugin, opts]` の2要素のためラッパが必要になる。

```ts
function shiki(o) {
  return rehypeShikiFromHighlighter.call(this, highlighter, o);
}
```

### JSX とレイアウト

`jsxImportSource: "@ox-content/vite-plugin"` を指定し、 `renderToString` / `raw`
/ `when` / `each` / `Fragment` をパッケージルートから import する。Markdown
のレンダリング結果は `raw()` で差し込む。

```ts
renderToString(
  PostLayout({ title, pubDate, emoji, styles, children: raw(res.html) }),
);
```

**`renderToString` は同期である。** Promise
を返すコンポーネントは無言で破棄され、 空文字になる。本リポジトリは CLAUDE.md
の規約により7コンポーネントが `async` 宣言されているが、いずれも `await`
していない形式的なものなので、キーワードの 除去のみで対応する。

将来コンポーネント内で非同期処理が必要になった場合は、処理を `routes()` /
`render()` 側へ寄せて解決済みの値を渡す方針とする。

### スタイルシート

`ssrStylesheets: { modules: ["<レイアウトのモジュールID>"] }` を指定し、
レイアウトから `import "../../style.css"` する。`<link>` の href は
`ctx.assets.ssrStylesheets({ modules }).stylesheets[].href` から取得して
レイアウトへ props で渡す。ハッシュ付きファイル名がそのまま利用できる。

### フィード (`feed.ts`)

現行 `feed` プラグインの出力に合わせて自前実装する。日付規則は現行 `git_date.ts`
を踏襲するが、実装は差し替える。

**現行の問題点:** `git_date.ts` は1ファイルにつき `git log` を同期spawnして
おり、447ファイルで約3.8秒かかる。移行にあたり `git log --name-only` の
1回走査に置き換える (同等の情報が約0.03秒で得られる)。

**踏みやすい罠が2つある。**

1. `new Date("Sep 11 2026")` はローカル時刻(JST)として解釈され、`setUTCHours`
   と組み合わせると日付が1日ずれる。ファイル名の `YYYY-MM-DD` を `T00:00:00Z`
   として扱う
2. 同一日に複数記事がある場合、日付のみでソートすると順序が不定になる。 合成日時
   (日付 + 初回コミット時刻) でソートする

### 将来のorg移行に対する接続点

`render()` が任意のHTML文字列を返す契約であるため、拡張子による分岐のみで Org
を受け入れられる。`srcDir` スキャンに依存せずルート定義側でファイルを
列挙する設計のため、ox-content 側の対応拡張子の制約も受けない。

```ts
render: (async () => {
  const html = p.file.endsWith(".org")
    ? await renderOrg(p.file) // uniorg (本移行では実装しない)
    : (await transformMarkdown(source, p.file, MD_OPTIONS)).html;
  return { html: shell(p.title, html) };
});
```

uniorg (`uniorg-parse` → `uniorg-rehype` → `rehype-stringify`) が期待どおり HTML
を出力することは確認済みである。

## 回帰検証の戦略

URL互換性は本移行の最優先制約であり、目視では担保できない。移行前の `_site` から
全URLを固定ファイルとして書き出し、新ビルドの出力と機械的に照合してCIを失敗させる。

```
1. 移行前に  _site から472件のURL一覧を生成しコミット
2. 移行後は  dist の出力と照合
3. 差分が1件でもあればCIを失敗させる
```

フィードについても、移行前に取得した `feed.xml` / `feed.json` と title / link /
pubDate / id / date_published を照合する。

## リスクと軽減策

| リスク                      | 影響                                    | 軽減策                                       |
| --------------------------- | --------------------------------------- | -------------------------------------------- |
| ox-content のバージョン追従 | v3.2.6 と比較的若く、API変更の可能性    | バージョンを固定し、更新時は回帰テストで検証 |
| dependencies 宣言漏れ       | 開発時に変更が反映されない (無言で失敗) | 全ルートで宣言し、PoCの手順をタスクに明記    |
| `async` コンポーネント      | 描画が無言で空になる                    | 移行初期に全コンポーネントから機械的に除去   |
| `fetchogp.ts` のDeno依存    | linkcard が動作しない                   | Node互換実装へ置換し、生成数(162記事)で検証  |
| 一覧ページのデザイン移植    | 工数の本体。PoC未検証                   | 記事ページの移植パターンを確立してから着手   |

## 未検証の領域

以下はPoCで確認していない。実装時に検証が必要である。

- 一覧ページ (`/`・`/all/{n}/`・`/tech/{n}/`・`/diary/{n}/`) のデザイン移植
  (PoCはルーティングのみで中身は最小限のHTML)
- `me` / `info` / `hub` ページの本文
- `fetchogp.ts` のNode移植後の実動作
- 検索機能の置き換え
- Cloudflare Pages への実デプロイ

## 設計決定ログ

**内蔵ブログモードを採用しない** — ox-content には `blog` オプション
(ページネーション・タグ・アーカイブ) があるが、生成URLが `/blog/page/{n}/`・
`/blog/tags/{slug}/` に固定されており、現行の `/all/{n}/`・`/tech/{n}/`・
`/diary/{n}/` と互換性がない。URL互換性を最優先制約とするため custom-host
を選ぶ。

**React / Preact を採用しない** — ox-content 同梱の jsx-runtime で必要十分で
あり、追加依存を持ち込まない。同期レンダリングの制約は現行コードの構造と衝突
しない。

**ネイティブ Rust パイプラインより既存プラグイン資産を優先する** — JSプラグイン
の使用でMarkdownレンダリングは23倍遅くなるが、絶対値は447記事で0.73秒であり、
書き直しのコストとリスクに見合わない。

**`content:encoded` の扱いは要判断** — 現行の本番フィードは本文に生の Markdown
を入れている (`## 見出し` がそのまま配信されている) が、これは既存の不具合と
考えられる。PoCでは正しくHTMLを出力しているため、現行と完全一致させるか、この
機会に修正するかを実装前に決める必要がある。
