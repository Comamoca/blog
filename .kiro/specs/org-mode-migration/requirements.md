# Requirements Document

## Introduction

本ブログ (comamoca.dev) は現在
[ox-content](https://github.com/ubugeeei-prod/ox-content) (Rustコア + Vite
custom-host) 上で Markdown 記事を配信している。執筆者は Emacs
ユーザーであり、記法・執筆環境・ビルドパイプラインを org-mode へ統一したい。

ox-content 自体は org を解釈できない (パーサは CommonMark + GFM + MDX
のみ。`.md` 以外の拡張子を追加しても中身は CommonMark パーサに投入されるため org
は壊れる)。 したがって本仕様では ox-content を置き換えるのではなく、custom-host
の `render()` が「任意のHTML文字列を返せる」契約であることを利用し、拡張子
`.org` の 記事を uniorg ベースのパイプラインで HTML
化する。これにより、ルーティング・TSX
レイアウト・フィード・Pagefind・URL互換の資産を維持したまま、コンテンツ形式と
執筆ワークフローを org へ移行する。

本仕様が対象とするのは「記事ファイル」「Markdown
テンプレート」「ビルドシステム」 「Emacs側ワークフロー」の4領域である。TSX
レイアウトは調査の結果 format-agnostic (スカラーなメタデータ +
任意のHTML文字列のみを受け取る) であるため org 化の対象外とする。

最優先の制約は既存URLの完全互換の維持である。ブログは472件の公開URLを持ち、外部
からの被リンクとRSS購読者が存在するため、ソース拡張子が `.md` から `.org` に
変わっても出力URL (`/blog/{YYYY-MM-DD}-{slug}/`) は不変でなければならない。

本仕様の設計判断は Oracle へのアーキテクチャ相談と、リポジトリおよび dotfiles の
実機調査に基づく。実機で未検証の事項は「未検証」と明示する。

## Requirements

### Requirement 1: org 記事のレンダリング

**Objective:** 執筆者として、`.org` ファイルで書いた記事が Markdown 記事と同等に
レンダリングされることを望む

#### Acceptance Criteria

1. WHEN `.org` 記事をビルドする THEN uniorg 系パイプラインで HTML を生成し、
   既存の `.prose` レイアウトへ `raw()` 経由で注入されること
2. WHEN org の `#+begin_src <lang>` ブロックを描画する THEN 既存と同じ Shiki
   (catppuccin-mocha) のハイライトが適用されること
3. WHEN org の脚注 (`[fn:1]` / `[fn:1:定義]`) を描画する THEN サイト既定の脚注
   マークアップ (`#footnote-label` の見出しテキストが「脚注」、戻りリンクが `↩︎`)
   に正規化されること
4. WHEN org のテーブルを描画する THEN HTML テーブルとして描画されること
5. WHEN org の `#+begin_export html` ブロック / `@@html:...@@` インラインを
   描画する THEN 生HTMLがそのまま出力されること
6. WHEN org のインラインコード (`~code~` / `=code=`) を描画する THEN `<code>`
   として描画されること
7. IF org のパースまたは描画に失敗する THEN ビルドを失敗させ、原因のファイル
   パスを報告すること

### Requirement 2: 既存描画機能の等価性

**Objective:** 読者として、リンクカード等の既存機能が org 記事でも同一に動作する
ことを望む

#### Acceptance Criteria

1. WHEN org の段落が単一の裸URLのみで構成される THEN 既存と同じリンクカード
   (OGP画像・タイトル・説明) が生成されること
2. WHEN リンクカードの OGP を取得する THEN 既存のファイルキャッシュ
   (`.cache/fetchogp`) を共有し、重複取得しないこと
3. WHEN `DISABLE_LINKCARD` 環境変数が設定されている THEN リンクカードを
   生成しないこと
4. WHEN org 記事を描画する THEN 見出し・段落・強調・リストが Markdown 記事と
   視覚的に区別できないこと

### Requirement 3: frontmatter (キーワード) の等価マッピング

**Objective:** ビルド側として、org のキーワードが既存の Post モデルへ正しく変換
されることを望む

#### Acceptance Criteria

1. WHEN org の `#+TITLE:` / `#+DESCRIPTION:` を読む THEN 既存 Post の
   title/description にマップされること
2. WHEN org の `#+DATE: [YYYY-MM-DD ...]` を読む THEN 既存と同じ表示形式
   (`MMM d yyyy`) へ正規化され、ソート (`pubDateMs`) と表示が同一に動作すること
3. WHEN org のタグ指定 (`#+FILETAGS:` 等) を読む THEN 既存の tags 配列
   (`string[]`) にマップされること
4. WHEN org 記事が draft 相当のキーワード (`#+DRAFT: true`) を持つ THEN
   出力から除外されること
5. WHEN emoji キーワード (`#+EMOJI:`) を読む THEN 既存と同じ Twemoji 描画へ
   渡されること

### Requirement 4: URL・フィード互換の維持

**Objective:** 既存の被リンク元およびRSS購読者として、移行後もURLとフィードが
不変であることを望む

#### Acceptance Criteria

1. WHEN 移行後のサイトをビルドする THEN 本番 sitemap に含まれる472件のURL全てに
   対応する出力ファイルが生成されること
2. WHEN 記事URLを生成する THEN `/blog/{YYYY-MM-DD}-{slug}/` の形式を維持すること
3. IF 出力URL集合が移行前と1件でも差異を持つ THEN CIを失敗させること
4. WHEN RSS / JSON Feed を生成する THEN title / link / pubDate (id /
   date_published) が移行前と一致すること
5. WHEN 変換済みの org 記事の公開時刻を導出する THEN git 初回コミット時刻を
   既存の規則で参照でき、`.md` 削除後も変換前の時刻を維持できること

### Requirement 5: 記事作成ワークフロー (just / create.rb)

**Objective:** 執筆者として、慣れた `just` コマンドで org 記事を雛形から作成
できることを望む

#### Acceptance Criteria

1. WHEN `just new` を実行する THEN `.org` の記事雛形 (orgキーワード + org見出し)
   が `src/blog/` に生成されること
2. WHEN `just diary` を実行する THEN `.org` の日報雛形が
   `src/blog/YYYY-MM-DD-diary.org` として生成されること
3. WHEN `just open` / `just edit-diary` / `just latest-diary` を実行する THEN
   `.org` 記事を対象に移行前と同じ UX (nu シェル + fzf / fd) で開けること

### Requirement 6: Emacs ワークフロー統合

**Objective:** 執筆者として、Emacs から org 記事を執筆・作成・貼付できることを
望む

#### Acceptance Criteria

1. WHEN org 記事のタグを入力する THEN org キーワードのタグが Corfu で補完される
   こと (`.org` 記事のタグを集計する)
2. WHEN `new-blog-article` / `latest-diary` / `create-diary-from-calendar` を
   実行する THEN `.org` 記事が生成されること
3. WHEN `consult-diary` / `consult-article` を実行する THEN `.org` 記事が
   一覧・選択されること
4. WHEN 画像を貼り付ける THEN org リンク (`[[/img/...]]`) が挿入されること
5. WHEN tempel テンプレートで記事を挿入する THEN org 構文の雛形が挿入され、
   org-mode バッファで発火すること

### Requirement 7: ビルド・テスト・デプロイの回帰防止

**Objective:** サイト管理者として、移行が CI で検証され安全にデプロイできること
を望む

#### Acceptance Criteria

1. WHEN テストを実行する THEN URL互換テスト (`tests/url_compat_test.ts`) が
   通り続けること
2. WHEN org 記事の golden テストを実行する THEN 脚注・コード・リンクカードの
   生成 HTML が期待どおりであること
3. WHEN dev サーバーで `.org` 記事を編集する THEN `dependencies` 宣言により
   編集がプレビューへ反映されること
4. WHEN OG Worker が参照する記事メタデータを読む THEN 形式 (md/org) に依存
   せずタイトル・説明を取得できること

### Requirement 8: 段階移行と Markdown パイプラインの除去

**Objective:** サイト管理者として、`.md` 記事を壊さずに段階的に移行し、最終的に
Markdown パイプラインを除去できることを望む

#### Acceptance Criteria

1. WHEN Phase 1 で org パイプラインを追加する THEN 既存 `.md` 記事の描画結果は
   一切変化しないこと
2. WHILE `.md` と `.org` が併存する THEN サイトは双方を同一のURL規則で配信する
   こと
3. WHEN 全記事の org 変換が完了する THEN `pre-md-removal` タグを打ち、 Markdown
   パイプラインを除去できること
4. WHEN Markdown パイプラインを除去する THEN Emacs 側の `.md` 対応も同時に
   除去され、`just` と Emacs のどちらの経路からも `.md` が生成されないこと
