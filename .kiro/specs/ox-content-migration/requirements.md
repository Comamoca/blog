# Requirements Document

## Introduction

本ブログ (comamoca.dev) は Lume v3 (Deno製SSG) で構築されている。記事数が447本
(公開421本) に達した結果、`deno task serve` の差分リビルドが記事1本の保存ごとに
サイト全体を再レンダリングする構造になっており、編集からプレビュー反映までに実測
で約29秒かかっていた。Lume
は内容が変わらなかったファイルの書き込みだけをスキップ
する方式のため、このコストは記事数に対して O(n) で増加し続ける。

暫定対応として重量級プラグイン (linkcard / gitDate / pagefind) を `RELEASE`
ガードの内側へ移し、28.6秒→4.5秒まで短縮した (PR #41)。しかし O(n) という性質
自体は変わらないため、本仕様では静的サイト生成基盤を
[ox-content](https://github.com/ubugeeei-prod/ox-content) (Rustコア + Vite
プラグイン) へ移行し、リクエスト時に該当ページのみをレンダリングする O(1) の
開発体験へ移行する。

移行にあたっての最優先の制約は **既存URLの完全な互換性維持** である。ブログは
472件の公開URLを持ち、外部からの被リンクおよびRSS購読者が存在するため、1件でも
URLが変化することは許容しない。

本仕様の内容は、全447記事を投入した実機PoCによって検証済みである。未検証の推測に
基づく記述は「未検証」として明示する。

## Requirements

### Requirement 1: URL互換性の完全維持

**Objective:** 既存の読者および外部からの被リンク元として、移行後も全てのURLが
移行前と同一のまま解決されることを望む

#### Acceptance Criteria

1. WHEN 移行後のサイトをビルドする THEN
   本番sitemap.xmlに含まれる472件のURL全てに
   対応する出力ファイルが生成されること
2. WHEN 記事ページのURLを生成する THEN `/blog/{YYYY-MM-DD}-{slug}/` の形式を
   維持すること
3. WHEN ページネーションを生成する THEN `/all/{n}/`・`/tech/{n}/`・`/diary/{n}/`
   の形式および各ページの件数 (10件/ページ) を維持すること
4. WHEN 静的ページを生成する THEN `/me.html`・`/info.html`・`/hub.html`・
   `/404.html` の拡張子付きパスを維持すること
5. WHEN フィードを生成する THEN `/api/feed.xml`・`/api/feed.json` のパスを
   維持すること
6. WHEN `draft: true` の記事が存在する THEN 出力に含めないこと
   (現行と同じく26本を 除外し、公開421本のみを出力すること)
7. IF 出力URL集合が移行前と1件でも差異を持つ THEN CIを失敗させること

### Requirement 2: プレビュー反映の高速化

**Objective:** 執筆者として、記事を保存してからプレビューに反映されるまでの待ち
時間が記事数に依存せず、体感的に即座であることを望む

#### Acceptance Criteria

1. WHEN 記事ファイルを保存する THEN 1秒以内にプレビューへ反映されること
2. WHEN 記事数が増加する THEN 反映時間が記事数に比例して増加しないこと
   (リクエスト時レンダリングによる O(1) 特性)
3. WHEN 開発サーバーを起動する THEN 5秒以内にリクエスト受付可能になること
4. WHEN 一覧ページに影響する変更 (記事の追加・削除・frontmatter変更) を行う THEN
   一覧ページにも反映されること
5. IF ルートが依存するファイルを宣言していない THEN
   開発サーバーが応答をキャッシュ
   し続け反映されないため、全ルートに依存関係を宣言すること

### Requirement 3: 既存Markdown処理資産の継続利用

**Objective:**
サイト管理者として、これまで蓄積した記事の描画ロジックを書き直さず
に移行できることを望む

#### Acceptance Criteria

1. WHEN 記事本文をレンダリングする THEN 既存の remark プラグイン (`linkcard`) が
   そのまま動作すること
2. WHEN コードブロックをレンダリングする THEN 既存の rehype プラグイン
   (`@shikijs/rehype`, catppuccin-mocha テーマ) がそのまま動作すること
3. WHEN 脚注を含む記事をレンダリングする THEN 既存の `footnote.ts` のセレクタ
   (`#footnote-label` / `[data-footnote-backref]` / `.footnotes ol`) が 一致する
   remark 互換のマークアップが出力されること
4. WHEN 移行後のリンクカード生成数を数える THEN 移行前と同数 (162記事)
   であること
5. IF プラグインのDeno固有API依存が存在する THEN Node互換の実装へ置換すること
   (対象: `utils/fetchogp.ts` の deno-dom / Cache API / jsr: インポート)

### Requirement 4: デザインの維持

**Objective:** 読者として、移行の前後でサイトの見た目が変化しないことを望む

#### Acceptance Criteria

1. WHEN スタイルシートをビルドする THEN 既存の `src/style.css` を変更せずに
   利用できること (Tailwind v4 の `@plugin` / `@theme` / `@apply` /
   `@source inline` 記法を含む)
2. WHEN CSSを生成する THEN DaisyUI v5 および `@tailwindcss/typography` の
   クラスが含まれること
3. WHEN 生成HTMLで使用されているクラスを検証する THEN Tailwind由来のクラスに
   未定義のものが存在しないこと
4. WHEN 既存のTSXコンポーネントを移植する THEN ロジックの変更を伴わないこと
   (型注釈と `async` キーワードの除去のみ許容する)
5. IF コンポーネントが `async` 宣言されている THEN レンダリング結果が無言で空に
   なるため、全コンポーネントから `async` を除去すること

### Requirement 5: フィードの互換維持

**Objective:** RSS購読者として、移行によって購読が壊れたり過去記事が再配信され
たりしないことを望む

#### Acceptance Criteria

1. WHEN RSSを生成する THEN channel要素 (title / link / description / language)
   および7つのXML名前空間 (atom / content / dc / slash / sy / webfeeds / wfw)
   を維持すること
2. WHEN item を生成する THEN 新しい順に10件を出力し、title / link / pubDate が
   移行前と一致すること
3. WHEN 記事の日付を決定する THEN 現行 `git_date.ts` と同じ規則 (日付部分は
   ファイル名、時刻部分はそのファイルを追加した最初のコミット) に従うこと
4. WHEN 同一日に複数の記事が存在する THEN 合成日時 (日付+コミット時刻) で
   ソートし、移行前と同じ順序になること
5. WHEN `lastBuildDate` を生成する THEN リポジトリの最新コミット時刻を用いること
6. WHEN JSON Feed を生成する THEN トップレベルキーおよびitemキーの構成を維持し、
   id / title / date_published が移行前と一致すること
7. WHEN 日付文字列をパースする THEN ファイル名の `YYYY-MM-DD`
   をUTCとして扱うこと (ローカル時刻として解釈すると日付が1日ずれる)

### Requirement 6: ビルド・デプロイ環境

**Objective:** サイト管理者として、移行後もNixOS上の開発環境とCloudflare Pages
へのデプロイが従来どおり機能することを望む

#### Acceptance Criteria

1. WHEN 開発環境を構築する THEN `flake.nix` の devShell から Node と
   パッケージマネージャが利用可能であること
2. WHEN `@ox-content/napi` をインストールする THEN NixOS上でプリビルドバイナリが
   patchelf や nix-ld なしで動作すること
3. WHEN 本番ビルドを実行する THEN Cloudflare Pages へデプロイ可能な静的成果物が
   生成されること
4. WHEN CIを実行する THEN URL互換性の回帰テストが実行されること

### Requirement 7: 周辺機能の移行

**Objective:** 読者として、検索・OG画像・サイトマップといった付随機能が移行後も
利用できることを望む

#### Acceptance Criteria

1. WHEN 検索機能を提供する THEN Pagefind の継続利用または ox-content 内蔵の
   BM25検索のいずれかで代替すること
2. WHEN OG画像のメタタグを出力する THEN 現行どおり og.comamoca.dev の動的生成
   Worker へ委譲すること (`og_metas.ts` の挙動を維持)
3. WHEN sitemap.xml を生成する THEN 移行前と同じURL集合を含むこと
4. IF 検索方式を変更する THEN `Search.tsx` および該当レイアウトの初期化処理を
   更新すること

### Requirement 8: 将来のorg移行に対する拡張性

**Objective:** 執筆者として、本移行の完了後に原稿を Markdown から Org へ移行する
際、ルーティングやレイアウトを作り直さずに済むことを望む

#### Acceptance Criteria

1. WHEN 記事のレンダリング処理を設計する THEN 拡張子に応じてレンダラを差し替え
   られる構造にすること
2. WHEN ファイルを読み込む THEN ox-content の `srcDir` スキャンに依存せず、
   ルート定義側でファイルを列挙すること
3. IF 本仕様の実装範囲に Org ファイルの取り扱いを含める THEN 対象外とすること
   (Org移行は uniorg を用いて本移行の完了後に別仕様として実施する)
