<div align="center">

![Last commit](https://img.shields.io/github/last-commit/Comamoca/blog?style=flat-square)
![Repository Stars](https://img.shields.io/github/stars/Comamoca/blog?style=flat-square)
![Issues](https://img.shields.io/github/issues/Comamoca/blog?style=flat-square)
![Open Issues](https://img.shields.io/github/issues-raw/Comamoca/blog?style=flat-square)
![Bug Issues](https://img.shields.io/github/issues/Comamoca/blog/bug?style=flat-square)

<img src="https://emoji2svg.deno.dev/api/🦊" alt="eyecatch" height="100">

# blog

こまもかのブログ

<br>
<br>

</div>

<table>
  <thead>
    <tr>
      <th style="text-align:center">🍡日本語</th>
      <th style="text-align:center"><a href="README.md">🍔English</a></th>
    </tr>
  </thead>
</table>

<div align="center">

</div>

## 🚀 使い方

[こちらのページ](https://comamoca.pages.dev)で公開されています。

## ⛏️ 開発

このリポジトリをクローンした後、以下のコマンドを実行してください。

```sh
bun install        # 依存関係のインストール
bun run dev        # 開発サーバ (http://localhost:5173)
```

すべてのタスクは `package.json` に定義し、Vite+ のタスクランナー (`vp run
<task>`) で実行します。引数なしで `vp run` を実行するとタスクの一覧が表示されます。

```sh
vp run test        # テストを実行 (Deno)
vp run fmt         # コードの整形 (Oxfmt)
vp run fmt:check   # 整形のチェック (書き込みなし)
vp run build       # 本番ビルド (dist/ へ出力)
vp run preview     # 本番ビルドを配信
```

なお `vp test` (Vitest) は **使用しません**。テストは `tests/` に置かれており
`jsr:@std/assert` と `Deno.*` API に依存しているため、Deno で実行します
(`vp run test` → `deno test --allow-all`)。

### 記事を書く

記事は [org-mode](https://orgmode.org) 形式で `src/blog/` に置きます。
ファイル名は `YYYY-MM-DD-title.org` (日報は `-diary.org` のサフィックス) です。

```sh
just new           # 新しい記事を作る
just diary         # 新しい日報を作る
just open          # 既存の記事を選んで編集する (nu + fzf が必要)
```

`#+DRAFT: true` を付けておくと未公開にできます。下書きは開発サーバでのみ
見え、本番ビルド・feed・sitemap・検索インデックスには一切含まれません。

## 📝 Todo

- [x] 検索機能の実装
- [ ] レコメンド機能の実装

## 🛠️ 技術スタック

- [ox-content](https://github.com/ubugeeei-prod/ox-content) (RustコアのSSG) +
  Vite+ カスタムホスト
- TailwindCSS v4 + DaisyUI v5
- org-mode コンテンツパイプライン (uniorg + Shiki)
- Pagefind によるクライアントサイド検索
- Cloudflare Pages でホスティング、OG画像生成は Cloudflare Worker

## 📜 ライセンス

[こちら](https://comamoca.pages.dev/info)に書いてあります。

## 👏 影響を受けたプロジェクト

[Deno blog](https://deno.land/x/blog@0.5.0)

## 💕 スペシャルサンクス

[CloudFlare](https://www.cloudflare.com/)
