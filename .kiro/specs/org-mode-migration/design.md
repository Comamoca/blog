# テクニカルデザイン文書

## 概要

### ゴール

- 記事ソースを `.md` から `.org`
  へ移行し、執筆・テンプレート・ビルドパイプライン・ Emacs 統合を org に統一する
- 既存URL 472件・RSS/JSON Feed・TSXレイアウト・Pagefind 検索・OG Worker を完全に
  維持する
- 段階的に移行し、各フェーズを可逆にする (org 対応を先に足し、最後に md を削除)
- 移行後は「ビルドシステムが org を理解する」状態にする (md パイプラインは削除)

### 対象外

- **ox-content 本体への org パーサ追加** — Rust
  コアの改造・上流コントリビュートは 行わない。ox-content は Markdown
  専用のまま使う
- **SSG の全面置換** — Emacs `ox-publish` / org-static-blog 等への置換は行わない
  (TSX レイアウト・Pagefind・OG Worker・URL互換の再構築コストに見合わない)
- **TSX レイアウトの org 化** — レイアウトは調査の結果 format-agnostic
  (`PostLayout` は title/pubDate/emoji/styles/description 等のスカラーと
  `raw(html)` children のみを受け取る) であり、対象外
- **記事本文の校正・内容変更** — 形式変換のみ。本文の意味的内容は変更しない
- **OG Worker 本体の改修** — メタデータは形式非依存で読めるため、原則変更しない

## 検証済みの事実

以下はリポジトリ・dotfiles の実機調査および Oracle 相談で確認済み。

| 事実                                                   | 根拠                                                                                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| ox-content は org 非対応                               | パーサは CommonMark+GFM+MDX。`is_markdown_file` は拡張子の前方一致のみ (`crates/ox_content_ssg/src/routes/files.rs`)             |
| `render()` は任意のHTML文字列を返せる                  | `host.ts` の各 route `render()` が `{ html }` を返す。design.md「将来のorg移行に対する接続点」で拡張子分岐を明示済み             |
| uniorg の HTML 出力は検証済み                          | `.kiro/specs/ox-content-migration/design.md:45,217-233`                                                                          |
| TSX レイアウトは format-agnostic                       | `PostLayout` props はスカラー + `raw(html)` children のみ                                                                        |
| feed はレンダリング済み HTML のみ消費                  | `ssg/feed.ts` は `FeedItem { contentHtml }` を受け取る                                                                           |
| feed の日付は「日付=ファイル名、時刻=git初回コミット」 | `combineDate` (`feed.ts:111-120`)。初回コミット時刻は `git log --diff-filter=A` の履歴全体から作るため `.md` 削除後も Map に残る |
| footnotePost は remark-gfm の脚注 markup を前提        | `ssg/markdown.ts:49-54` (`#footnote-label` → 「脚注」、`data-footnote-backref` → `↩︎`)                                            |
| linkcard は mdast バインド                             | `ssg/linkcard.ts` は mdast の `paragraph`/`text` を visit。`fetchOGInfo` はファイルキャッシュ (`.cache/fetchogp`)                |
| URL互換テストは形式非依存                              | `tests/url_compat_test.ts` は dist の HTML ファイル存在のみを検証                                                                |
| 既存 org 移行の作業は無い                              | `feat/org-support` / `feat/migrating-org-file` は `6972b0e` を指す空ブランチ (diff ゼロ、`.org` ファイル 0)                      |
| Emacs 側にブログ専用機構が既存                         | `dotfiles/emacs.d/init.el:2630-2781` (タグ補完), `2985-3093` (生成/貼付), `emacs.d/templates` (tempel)                           |

### Phase 0 検証結果 (実機、2026-10-08)

uniorg-parse@3.2.2 / uniorg-rehype@2.2.0 / rehype-raw@7 で実機検証した結果。

| 項目              | 結果                                                                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 見出し            | `*`→`<h1>`, `**`→`<h2>`, `***`→`<h3>`。レベルは pandoc が `##`→`**` と変換するため維持される                                                                                                                                                                       |
| コードブロック    | `#+begin_src ts` → `<pre class="src-block"><code class="language-ts">`。**`language-*` が出るため Shiki はそのまま適用可能**                                                                                                                                       |
| インラインコード  | `~code~` → `<code class="inline-code">`、`=code=` → `<code class="inline-verbatim">`                                                                                                                                                                               |
| テーブル          | `<table>` に正しく変換される                                                                                                                                                                                                                                       |
| リンク            | `[[url][text]]` → `<a href>text</a>`。`[[/img/x.png]]` → `<img src>`                                                                                                                                                                                               |
| 裸URL             | 自動で `<a href>…</a>` 化される (linkcard は HAST の `p > 単一 a` を対象にする)                                                                                                                                                                                    |
| **emphasis**      | **CJK隣接で失敗する**。`。*強調*と` / `*強調*の` は素のテキストのまま。**ZWSP(`\u200b`)を両側に置くと `<strong>` 化し、出力にも ZWSP が残るが不可視**。uniorg はデフォルトで ZWSP を pre/post ボーダーに含み、コメントで「Emacs も ZWSP をスペース扱いする」と明記 |
| 下線              | `_x_` は `<sub>` (subscript) になる。`_` は使わない                                                                                                                                                                                                                |
| 脚注              | **remark-gfm と全く別物**。参照 `<sup><a href="#fn.1" class="footref" id="fnr.1">`、定義は `<h1>Footnotes:</h1>` + `<div class="footnote-definition">`。既存 `footnotePost` は効かないため正規化が必須                                                             |
| 生HTML            | uniorg-rehype は非対応。**`rehype-raw` を挟むと `#+begin_export html` / `@@html:...@@` が素通しされる**。ただし pandoc は `#+begin_html` を出力し、これは export 扱いされない (要変換)                                                                             |
| keywords          | `uniorg-extract-keywords` は `file.data` に小文字キーで格納 (`{title, date, filetags, emoji, draft}`)。値は文字列                                                                                                                                                  |
| PROPERTIES drawer | `:PROPERTIES:/:CUSTOM_ID:` は無視される (害なし)                                                                                                                                                                                                                   |

pandoc 3.7.0.2 の `-f gfm -t org`
は見出しレベル・テーブル・リストを正しく変換するが、 **emphasis に ZWSP
を挿入しない**(そのため emphasis は別途対策が必要)ほか、
`:PROPERTIES:/:CUSTOM_ID:` を付加し、生HTML を `#+begin_html` で出力する。

## アーキテクチャ

### 既存アーキテクチャ分析

- 全ルートは `host.ts` の `routes()` が定義する programmatic な custom-host。
- 記事は `loadPosts()` が `src/blog` を列挙 → frontmatter を `@ox-content/napi`
  の `prepareSource()` で読む → `render()` が `renderMarkdown()` で HTML 化 →
  `PostLayout` に `raw(html)` で注入。
- Markdown の描画は `ssg/markdown.ts` の `renderMarkdown()` 一点に集約。
- ルーティング・レイアウト・feed・Pagefind・URL検証は Markdown
  形式に依存しない。

### 高レベルアーキテクチャ

```
src/blog/*.org  (#+TITLE: / #+DATE: / #+FILETAGS: / #+EMOJI: / #+DRAFT:)
   │
   ├─ メタデータ: ssg/org-meta.ts
   │    ・行ベースの #+KEYWORD: 抽出
   │    ・#+DATE: [YYYY-MM-DD ...] を既存表示形式 (MMM d yyyy) へ正規化
   │    → host.ts loadPosts() が .md と .org の双方を受理、Post 型は不変
   │
   └─ 本文: ssg/org.ts renderOrg()
          unified()
            .use(uniorgParse)                    # org -> orgast
            .use(uniorgRehype)                   # orgast -> hast
            .use(shiki, {themes})                # ssg/highlight.ts から共有
            .use(linkcardRehype)                 # HAST の p>単一URL -> カードHTML
            .use(footnoteNormalize)              # 脚注を gfm 相当構造へ
          → html 文字列 → footnotePost (既存) で仕上げ
   │
   ▼ host.ts の render() 分岐 (design.md の接続点)
render: p.file.endsWith(".org")
  ? await renderOrg(source, p.file)
  : (await renderMarkdown(source, p.file)).html
```

### 技術適合性

| 選択肢                    | 判定               | 理由                                                                                                                                  |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **uniorg** (採用)         | ◎                  | `uniorg-rehype` が HAST を出すため既存 `@shikijs/rehype` を再利用可能。`uniorg-extract-keywords` がある。design.md で接続性を検証済み |
| orga / orgajs             | ○ (フォールバック) | MIT で活発。同じ unified/HAST のため差し替え範囲は `ssg/org.ts` に限定。uniorg が停止した際の代替                                     |
| Pandoc (本文変換のみ採用) | △                  | HTML 出力は独自ハイライトでスタイル不一致。一方 `-f gfm -t org` の**変換ツール**としては最適 (一度きりの用途)                         |
| Emacs ox-publish          | ✗                  | TSX レイアウト・Pagefind・OG・URL互換を失う大改修。CI に emacs-nox が必須                                                             |
| ox-content コア拡張       | ✗                  | Rust 改造と上流依存。非現実的                                                                                                         |

## コンポーネント設計

### ssg/highlight.ts (共有)

`ssg/markdown.ts` 内の Shiki highlighter 生成と `shiki()`
ラッパーを新モジュールへ 切り出し、md / org
両パイプラインで同一インスタンスを共有する。テーマ
(`catppuccin-mocha`)・言語リスト・`inline:"tailing-curly-colon"` は現状維持。

### ssg/org-meta.ts

`loadPosts()` 用の軽量メタデータ抽出。全文パースはせず、先頭の `#+KEYWORD:` 行を
走査する。

- `#+TITLE:` → `title` (欠落時は stem)
- `#+DESCRIPTION:` → `description`
- `#+DATE: [YYYY-MM-DD ...]` → 既存 `pubDate` 形式 (`MMM d yyyy`) へ正規化
  (`pubDateMs = new Date(pubDate)` と表示の双方が動くように)
- `#+FILETAGS: :a:b:` → `tags: string[]`
- `#+EMOJI:` → `emoji`
- `#+DRAFT: true` → 出力除外

### ssg/org.ts

`renderOrg(source, file): Promise<{ html }>`。unified で org → HAST → HTML
文字列 を生成する。`transformMarkdown` (ox-content の md 専用) は通さない。

### ssg/linkcard-rehype.ts

`ssg/linkcard.ts` の `cardLinkElement()` を `export` し、HAST の `p` (子が単一
text で URL 正規表現に一致) をカード HTML へ置換する rehype プラグイン。OGP は
既存 `fetchOGInfo` のファイルキャッシュを共有する。`DISABLE_LINKCARD`
を尊重する。

- 注意: org の `[[url]]` リンクは `<a>`
  になるため対象外。**本文には裸URLを書く** という現行と同じ執筆規約を維持する。

### 脚注の正規化 (footnoteNormalize)

uniorg-rehype の出力する脚注構造を、既存 `footnotePost` と CSS が期待する gfm
相当 (`#footnote-label` / `data-footnote-backref`) へ正規化する小さな rehype
プラグイン。Phase 0 で差分を確定してから実装する。既存 `footnotePost` は共通利用
する (md/org 双方に適用)。

### host.ts

- `loadPosts()`: `.md` と `.org` の双方を列挙し、拡張子ごとにメタデータ抽出を
  分岐 (`prepareSource` / `ssg/org-meta.ts`)。stem は両拡張子を除去。
- `render()`: `p.file.endsWith(".org")` で `renderOrg` / `renderMarkdown`
  を分岐。
- feed 日付: 既存の `${BLOG_DIR}/${p.stem}.md` 参照を
  `commitTimes.get(...md) ?? commitTimes.get(...org)` に変更。変換済み記事は
  `.md` の初回コミット時刻が履歴に残るため元の時刻を維持し、移行後の新規 `.org`
  記事は `.org` の初回コミットを参照する。
- `dependencies`: 記事ルートは既に `p.relFile`
  を宣言しており拡張子変更に自動追随。

### create.rb / justfile

- `create.rb`: `diary_template` / `article_template` を org キーワード + org
  見出し (`* 今日やったこと`) に変更。出力パスを `.org` に変更。
- `justfile`: `just open` / `edit-diary` / `latest-diary` の `-diary.md` /
  `-e md` を `.org` に変更。`new` / `diary` は create.rb 経由のため自動追随。

### Emacs 側 (dotfiles)

「テンプレートの二重管理」に注意: 記事雛形は `create.rb` と Emacs
(`date-to-tempalte` / `emacs.d/templates`) の双方にあるため、両方を org 化する。

- タグ補完: `my/blog-tags-*` (init.el:2630-2781) の frontmatter YAML parse を
  org キーワード parse に変更。走査対象を `.org` に。CAPF 登録
  (`my/blog-markdown-capf-setup`, init.el:1709-1717) を `org-mode-hook`
  にも追加。
- 生成: `date-to-tempalte` / `create-diary-path` / `new-blog-article` /
  `latest-diary` / `create-diary-from-calendar` を `.org` +
  orgキーワード出力に。
- 一覧: `consult-diary` / `consult-article` の `-diary.md$` を `.org` に。
- 貼付: `blog-paste-image` (init.el:3086-3093) の `![](/img/x.png)` を
  `[[/img/x.png]]` に。
- テンプレート: `emacs.d/templates` の `diary`/`article` を `markdown-mode` から
  `org-mode` スコープへ移し org 構文に。

## データモデル (キーワードマッピング)

| frontmatter             | org                        | 備考                               |
| ----------------------- | -------------------------- | ---------------------------------- |
| `title`                 | `#+TITLE:`                 | 欠落時は stem                      |
| `description`           | `#+DESCRIPTION:`           |                                    |
| `pubDate: "Oct 9 2025"` | `#+DATE: [2025-10-09 Thu]` | extractor で `MMM d yyyy` に正規化 |
| `emoji`                 | `#+EMOJI:`                 | カスタムキーワード                 |
| `tags: [a, b]`          | `#+FILETAGS: :a:b:`        | コロン区切り → 配列                |
| `draft: true`           | `#+DRAFT: true`            | 出力除外                           |

## エラーハンドリング

- org のパース/描画失敗はビルドを失敗させ、原因ファイルパスを出力する (無言の
  空ページ化を防ぐ)。
- メタデータの型不整合 (tags が配列でない等)
  は既存同様に防御的に既定値へ落とす。
- `#+DATE:` の欠落時はファイル名先頭10文字を日付にフォールバックする。

## テスト戦略

- `tests/url_compat_test.ts`: 無修正。移行の主たる安全網 (472件)。
- `tests/feed_compat_test.ts` / `tests/ssg_feed_test.ts`: feed 日付の
  dual-lookup ケースを追加。
- `tests/diary.test.ts`: `.md` と `.org` の双方を対象に、ファイル名日付と
  `#+DATE:` の一致を検証するよう拡張。
- **org golden test (新規)**: 脚注・`#+begin_src`・裸URL・テーブル・
  `#+begin_export html` を含む fixture を org→HTML 変換し、期待 HTML
  を断言する。 uniorg → orga 差し替え時の検証にもなる。
- 視覚回帰: Phase 2/3 で dist HTML の差分と RSS のバイト一致を gate にする。

## 移行戦略

| Phase                   | 内容                                                                        | 可逆性                 |
| ----------------------- | --------------------------------------------------------------------------- | ---------------------- |
| 0. Spike                | `renderOrg` 試作。脚注/src/日記の実出力を検証し正規化方針を確定             | 廃棄のみ               |
| 1. org パイプライン追加 | `ssg/org*.ts` 等 + host.ts 分岐。**md は無傷**                              | 分岐 revert で完全可逆 |
| 2. 変換器 + パイロット  | `md2org` + 代表 5-10 記事。dist HTML 差分・RSS一致を検証                    | ファイル単位 revert    |
| 3. 一括変換             | 年度単位バッチ。各回 url_compat + diff                                      | バッチ単位 revert      |
| 4. カットオーバー       | `pre-md-removal` タグ → md パイプライン削除 + Emacs/justfile の md 対応削除 | タグから復元可能       |

協調制約: Emacs の生成関数が `.md` を吐く限り Phase 4 (md 削除) は実行できない。
Phase 1 で Emacs 側を**両対応**にしておき、Phase 4 で「blog の md 削除」と
「Emacs/justfile の md 対応削除」を同時に着地させる。

## リスクと軽減策

1. **脚注 markup の乖離** — `footnotePost` の置換が効かず脚注 UX が壊れる。 →
   Phase 0 で差分を確定、正規化 plugin + golden test
   で固定。着手前に影響記事数を 数える
   (`grep -l '\[\^' src/blog/*.md | wc -l`)。
2. **変換 fidelity (447記事)** — 表・生HTML・inline HTML の pandoc 逃し。 → org
   ソースではなく **dist HTML の差分**を gate にする。
3. **feed 日付の drift** — `combineDate` は日付をファイル名から取るため移行日に
   跳ばないが、キー不一致で時刻が 00:00:00Z に落ちる。→ dual-lookup 修正 + RSS
   バイト diff。
4. **uniorg の保守性・org構文カバレッジ** — マクロ・`#+INCLUDE` 等の穴。 →
   影響範囲を `ssg/org.ts` に封じ込め、orga への差し替え経路を golden test
   で担保。
5. **dev サーバーのキャッシュ罠** — `dependencies`
   宣言漏れは無言で反映されない。 → Phase 1 で `.org` 編集→反映を実機確認。
6. **テンプレートの二重管理** — create.rb と Emacs の雛形が不整合になる。 → 同一
   PR で両方を org 化。

## 未検証の領域

- pandoc gfm→org の 447 記事での往復精度 (emphasis
  以外の方言)。パイロットで確認する。
- Emacs `org-mode` が `.org` 記事で `#+FILETAGS` 補完を正しく発火する範囲。
- 脚注正規化の実装方式 (uniorg-rehype の `footnotesSection`/`handlers`
  を使うか、 HAST 後処理か)。
- emphasis への ZWSP 挿入を pandoc 後処理で行うか、mdast→org
  の自作変換器で行うか (Phase 2 冒頭で spike して確定する)。

## 設計決定ログ

- **2026-10-08: 案A (ox-content 温存 + org パイプライン追加) を採用。** 全面置換
  (案B/C) は TSX レイアウト・Pagefind・OG・URL互換の再構築コストに見合わない。
  `render()` の拡張子分岐は design.md が意図的に残した接続点であり、uniorg の
  接続性は検証済み。org ファイルは標準 org のため、将来 Emacs ox-publish
  へ移りたく なっても内容の再変換は不要 (レイアウトのみ改修)。
- **2026-10-08: レイアウトは org 化しない。** `PostLayout` はスカラー +
  `raw(html)` のみで Markdown テンプレではない。org のテンプレ機構
  (`#+SETUPFILE:`/`#+MACRO:`) は個別記事の雛形用途に留める。
- **2026-10-08: 本文変換は pandoc を一度きりで使用。** ビルドには含めない
  (`nix shell nixpkgs#pandoc` を一時利用、flake は変更しない)。
- **2026-10-08: `just` ベース作成を維持 (案a)。** create.rb を org
  出力へ変更し、 `just open` 系は同一 UX を保ったまま拡張子のみ `.org` へ。
- **2026-10-08: Emacs 側 (dotfiles) も本仕様の対象。**
  ブログ専用機構が既存のため、 md 削除と同時に md 対応を除去する必要がある。
- **2026-10-08: emphasis は ZWSP ボーダーで解決する。** CJK 隣接の `*強調*` は
  org の emphasis 規則で失敗する (182 件中 150 件が該当)。uniorg はデフォルトで
  ZWSP を pre/post に含み Emacs とも整合するため、変換器は emphasis
  マーカーの**両側**に ZWSP を挿入する
  (片側のみでは失敗することを実機確認済み)。これにより HTML 出力は
  `<strong>`/`<em>` を維持し、ZWSP は不可視。
- **2026-10-08: 生HTML は `rehype-raw` で扱う。** `ssg/org.ts` のパイプラインに
  `rehype-raw` を挟む。pandoc が出力する `#+begin_html` は export
  扱いされないため、 変換器で `#+begin_export html` へ正規化する。
