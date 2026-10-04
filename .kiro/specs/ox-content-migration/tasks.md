# 実装計画

-
  1. [ ] 回帰検証の土台づくり (最初に行う)
- [x] 1.1 移行前のURLスナップショットを固定化
  - 現行 `RELEASE=1` ビルドの `_site` から全出力URLを列挙し、
    `tests/fixtures/urls.txt` としてコミットする
  - 本番 sitemap.xml とも突き合わせ、472件であることを確認する
  - _Requirements: 1.1, 1.7_

- [x] 1.2 移行前のフィードスナップショットを固定化
  - 現行の `api/feed.xml` / `api/feed.json` を `tests/fixtures/` へ保存する
  - 比較対象は title / link / pubDate / id / date_published とする
    (本文は別途判断するため対象外)
  - _Requirements: 5.2, 5.6_

- [x] 1.3 URL照合テストの作成
  - 出力ディレクトリと `urls.txt` を機械的に照合し、
    差分が1件でもあれば失敗するテストを書く
  - 逆方向 (出力にあってスナップショットに無いURL) も検出し、 ドラフト混入を防ぐ
  - _Requirements: 1.1, 1.6, 1.7_

-
  2. [ ] ビルド基盤のセットアップ
- [x] 2.1 Node/Vite ツールチェーンの導入
  - `package.json` に `@ox-content/vite-plugin` `@ox-content/unplugin` `vite`
    `@tailwindcss/vite` `tailwindcss` `daisyui` `@tailwindcss/typography`
    `date-fns` を定義する
  - バージョンは固定する (ox-content は v3.2.6 で検証済み)
  - _Requirements: 6.1_

- [x] 2.2 flake.nix の更新
  - devShell に Node とパッケージマネージャを追加する
  - `@ox-content/napi` のプリビルドバイナリが patchelf なしで動作することを
    確認する (検証済みだが環境変更後に再確認する)
  - _Requirements: 6.1, 6.2_

- [x] 2.3 Vite 設定の作成
  - `esbuild: { jsx: "automatic", jsxImportSource: "@ox-content/vite-plugin" }`
  - `@tailwindcss/vite` と `oxContentCustomHost` を登録する
  - `dev.routeDependencies` に記事ディレクトリを指定する
  - _Requirements: 2.5, 4.1_

-
  3. [ ] Markdown パイプラインの移植
- [x] 3.1 全コンポーネントから `async` を除去
  - `src/_components/*.tsx` の7ファイルと `Header.tsx` の `HeaderLink`
  - いずれも `await` していないためロジック変更は不要
  - 除去漏れは描画が無言で空になるため、除去後にgrepで確認する
  - _Requirements: 4.4, 4.5_

- [x] 3.2 `fetchogp.ts` の Node 移植
  - `jsr:@b-fuze/deno-dom` → Node のHTMLパーサ (linkedom 等)
  - Deno Cache API (`caches`) → ファイルベースのキャッシュ
  - `jsr:@core/unknownutil` / `jsr:@std/*` → npm 相当へ置換
  - `linkcard.ts` 本体 (unist-util-visit) は無改造で動く
  - _Requirements: 3.1, 3.5_

- [x] 3.3 プラグイン設定の組み立て
  - `plugin.remark` に linkcard、`plugin.rehype` に shiki、 `plugin.oxContent`
    に footnote の後処理を登録する
  - shiki は3引数形式のためラッパ関数で包む
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.4 レンダリング結果の検証
  - リンクカードの生成数が移行前と同数 (162記事) であること
  - shiki が catppuccin-mocha で適用されていること
  - 脚注の `#footnote-label` と `[data-footnote-backref]` が
    既存セレクタで置換されること
  - _Requirements: 3.3, 3.4_

-
  4. [ ] 記事ページの移植
- [x] 4.1 記事ルートの定義
  - frontmatter は `prepareSource()` で読む (全文パース不要)
  - `draft: true` を除外する
  - URL は `/blog/{ファイル名のstem}/`
  - `dependencies` に自身のソースファイルを宣言する
  - _Requirements: 1.2, 1.6, 2.5_

- [x] 4.2 `post.tsx` の移植
  - `Lume.Data` / `Lume.Helpers` の型注釈をローカル型へ置換する
  - Markdown の描画結果は `raw()` で差し込む
  - `<link rel="stylesheet">` を props 経由に変更する
  - _Requirements: 4.4_

- [x] 4.3 スタイルシートの配線
  - レイアウトから `import "./style.css"` する
  - `ssrStylesheets` にレイアウトのモジュールIDを指定する
  - `ctx.assets.ssrStylesheets().stylesheets[].href` をレイアウトへ渡す
  - _Requirements: 4.1, 4.2_

- [x] 4.4 CSS の網羅性検証
  - 生成HTMLで使われている全クラスを抽出し、
    Tailwind由来のものに未定義が無いことを確認する
  - DaisyUI / typography / `@theme` のカスタム変数が含まれることを確認する
  - _Requirements: 4.2, 4.3_

-
  5. [ ] 一覧ページ・静的ページの移植
- [x] 5.1 ページネーションルートの定義
  - `/all/{n}/` (日報以外)・`/tech/{n}/` (tech タグ)・`/diary/{n}/` (日報)
  - 1ページ10件、`pubDate` 降順
  - `dependencies` に記事ディレクトリを宣言する
  - _Requirements: 1.3, 2.4, 2.5_

- [x] 5.2 一覧ページのデザイン移植
  - `main.tsx` レイアウトと `PostList` / `PostCard` / `Logo` / `Header` /
    `Footer` / `Search` / `Twemoji` を移植する
  - Lume の `comp.X` 参照を直接 import へ置換する
  - ページ送りのリンク生成 (`utils/paginate.ts`) を流用する
  - _Requirements: 4.4_

- [x] 5.3 トップページと静的ページ
  - `/` (最新8件 + 導線カード)
  - `/me.html` `/info.html` `/hub.html`
  - `notFound()` で `/404.html`
  - _Requirements: 1.4_

-
  6. [ ] フィードの移植
- [x] 6.1 git 日付ロジックのバッチ化
  - `git log --diff-filter=A --format=%ct --name-only` の1回走査で
    全ファイルの初回コミット時刻を取得する
  - 現行の1ファイルずつ spawn する方式 (447回で約3.8秒) を置き換える
  - _Requirements: 5.3_

- [x] 6.2 RSS / JSON Feed の実装
  - channel要素と7つのXML名前空間を維持する
  - ファイル名の日付は `T00:00:00Z` としてUTCで扱う (ローカル解釈は1日ずれる)
  - 合成日時 (日付 + 初回コミット時刻) でソートしてから10件に絞る
  - `lastBuildDate` はリポジトリの最新コミット時刻を使う
  - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.7_

- [x] 6.3 フィードの照合
  - 1.2 で保存したスナップショットと title / link / pubDate / id /
    date_published を照合する
  - _Requirements: 5.2, 5.6_

- [x] 6.4 `content:encoded` の方針決定
  - 現行は本文に生の Markdown が入っている (既存の不具合と考えられる)
  - 完全一致を採るか、この機会に HTML へ修正するかを決める
  - 決定を design.md の設計決定ログへ追記する
  - _Requirements: 5.1_

-
  7. [ ] 周辺機能の移植
- [x] 7.1 検索機能
  - Pagefind 継続か ox-content 内蔵BM25かを決定する
  - `Search.tsx` と初期化処理を更新する
  - 併せて `post.tsx:111-114` の埋め込みスクリプトの構文エラー
    (閉じ波括弧が1つ多い) を解消する
  - _Requirements: 7.1, 7.4_

- [x] 7.2 OG画像メタタグ
  - `og_metas.ts` のURL生成ロジックを移植する
  - og.comamoca.dev への委譲と80字切り詰めの挙動を維持する
  - _Requirements: 7.2_

- [x] 7.3 sitemap.xml
  - 移行前と同じURL集合を含むことを 1.3 のテストで確認する
  - _Requirements: 7.3_

- [x] 7.4 既存の不正クラス名の修正
  - `className="border(t gray-200)"` は Tailwind として無効
  - `post.tsx` / `Footer.tsx` / `linkcard.ts` の3箇所
  - 現行でも効いていないため挙動は変わらない
  - _Requirements: 4.3_

-
  8. [ ] 統合と切り替え
- [x] 8.1 全URL・全フィードの最終照合
  - 472/472 の一致と余剰0を確認する
  - _Requirements: 1.1, 1.7, 5.2_

- [x] 8.2 性能の実測
  - 編集→反映が1秒以内であること
  - dev サーバー起動が5秒以内であること
  - _Requirements: 2.1, 2.3_

- [x] 8.3 CI の更新
  - URL照合テストをCIに組み込む
  - `deploy.yaml` のビルドコマンドを差し替える
  - paths フィルタに設定ファイルの変更を含める
  - _Requirements: 6.4_

- [x] 8.4 Cloudflare Pages へのデプロイと実機確認
  - 代表的なURLの応答確認
  - RSSリーダーでの購読継続確認
  - OG画像の表示確認
  - _Requirements: 6.3_

-
  9. [ ] Lume の撤去
- [x] 9.1 不要になった依存と設定の削除
  - `_config.ts`、`plugins/lume/`、Lume 関連の deno タスク
  - `deno.jsonc` の Lume インポートと lint プラグイン
  - _Requirements: 6.1_

- [x] 9.2 ドキュメントの更新
  - `CLAUDE.md` / `.kiro/steering/tech.md` / `structure.md` を
    新構成に合わせて更新する
  - `README.md` のビルド手順を更新する
  - _Requirements: 6.1_
