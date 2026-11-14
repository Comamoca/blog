---
name: comamoca-blog
description: comamoca.dev (Comamoca の個人ブログ) の記事を探して読む。記事一覧の取得、最新記事の確認、本文のMarkdown取得、サイト内検索に使う。
---

# comamoca.dev の読み方

## 最新記事を知る

- `GET https://comamoca.dev/api/feed.json` (JSON Feed) または `/api/feed.xml` (RSS) で最新10記事を取得する。

## 全記事を列挙する

- `GET https://comamoca.dev/sitemap.xml` に全ページのURLがある。記事は `/blog/YYYY-MM-DD-title/`。
- 一覧ページ: `/all/1` (全記事)、`/tech/1` (技術記事)、`/diary/1` (日記)。

## 本文をMarkdownで読む

- ページURLの末尾を `index.md` に置き換える (`/blog/<slug>/` → `/blog/<slug>/index.md`、`/me.html` → `/me.md`)。各ページの `<link rel="alternate" type="text/markdown">` にもURLがある。

## サイト内検索

- ブラウザ上では Pagefind (`/pagefind/pagefind.js`) で全文検索できる。
