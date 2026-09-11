# 実装計画

-
  1. [ ] Workerプロジェクトのセットアップ
- [x] 1.1 `og/` Gleamプロジェクトの新規作成
  - gleam.tomlにhinoto (git依存) / lustre / gleam_http / gleam_stdlib /
    gleam_javascript を定義
  - komeijiは作成中のためgit依存として定義 (未公開の場合はスタブを用意)
  - `hinoto/runtime/workers` で起動するエントリ (`src/og_worker.gleam`) を作成
  - flake.nixにgleamを追加
  - _Requirements: 5.1, 6.1_

- [x] 1.2 wrangler設定と静的アセットの配置
  - `og/wrangler.toml` を作成 (main / assets binding / og.comamoca.dev
    カスタムドメイン)
  - 背景画像 (`gakumas-sozai.png`) とアイコンを`og/static/`に配置
  - `wrangler dev` でローカル起動を確認
  - _Requirements: 6.1, 6.4_

-
  2. [ ] リクエスト処理の実装
- [x] 2.1 クエリパースとバリデーション
  - `gleam/uri` によるパラメータ解析 (`l` / `t` / `d`)
  - 必須パラメータ欠落・不正値で400を返す処理
  - レンダリング失敗時に500+ログを返しisolateが落ちない例外処理
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2.2 キャッシュ制御
  - Cache API (`caches.default`) への保存と参照
  - `Cache-Control: public, max-age=31536000, immutable` レスポンスヘッダ
  - _Requirements: 2.2, 2.3_

-
  3. [ ] 描画パイプラインの実装
- [x] 3.1 フォントサブセットの生成と読み込み
  - pyftsubsetでNoto Sans CJK JP Regular/Boldをサブセット (~1MB/ウェイト)
    しコミット
  - ASSETS bindingからの読み込みとisolate内キャッシュ
  - _Requirements: 5.3_

- [x] 3.2 resvg-wasm shimの実装
  - `og/src/og_worker/interop/resvg.mjs` (静的WASM import + initWasm +
    Resvg描画)
  - `@external(javascript, ...)` によるGleamバインディング
  - esbuild (wrangler) によるWASMプリコンパイルの動作確認
  - _Requirements: 5.2_

- [x] 3.3 Lustreカードコンポーネントの移植
  - `postOgImage.tsx` (タイトル55px/説明文32px/フッター) を`card.gleam`に移植
  - `mainOgImage.tsx` (サイト名80px) を移植し、NotoSansJP Black未登録バグを解消
  - 背景画像・アイコンのdata URI埋め込み
  - `element.to_string` でHTML化
  - _Requirements: 5.1, 5.4, 4.3_

- [x] 3.4 komeiji統合 (HTML→SVG→PNG)
  - komeijiインターフェース契約の固定: HTML文字列 + フォント + 画像data URI →
    SVG文字列
  - 文字折り返し・CJK改行の動作確認
  - SVG→PNG (resvg-wasm) までの通し動作確認
  - 実装済み: ローカルパスのkomeiji (satori互換VDOM生成) + satori 0.33 +
    harfbuzzjsを Workers向けラッパ (setup_env.mjs / harfbuzzjs_worker.mjs /
    [alias]) で統合
    - 動的importによるリクエストスコープ評価
    - yoga.wasm: satori.init() にプリコンパイル済みモジュールを供給
    - harfbuzzjs: instantiateWasmフック + addFunction用shim事前コンパイル
  - _Requirements: 5.1, 5.4, 5.5_

-
  4. [ ] Lume側の変更
- [x] 4.1 og-metasフックの実装
  - `ogLayout: "post" | "main"` データキーへの置換 (blog/_data.js + 8ページ)
  - `site.process([".html"], ...)` で `metas.image` にWorker URLを設定
  - 80字+「…」の切り詰め (旧`MAX_DESCRIPTION_LENGTH`を移植)
  - RELEASE未設定時はフックを無効化
  - URL生成の決定性 (同一コンテンツ→同一URL) のテスト
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.2 ビルド時生成の撤去
  - `_config.ts:108-142` のog_imagesプラグインブロック削除
  - `postOgImage.tsx` / `mainOgImage.tsx` と背景画像参照の削除
  - CIの `_cache` キャッシュステップ削除
  - RELEASE=1ビルドでOG画像PNGが出力されないことの確認、ビルド時間計測
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

-
  5. [ ] デプロイとCI
- [x] 5.1 Workerデプロイの追加
  - deploy.yamlに `gleam build --target javascript` → `wrangler deploy`
    ジョブを追加
  - og.comamoca.dev カスタムドメインのDNS確認
  - サイトのみの再デプロイでWorkerが不要なことの確認
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5.2 スクリプトサイズとランタイム制約の確認
  - バンドルサイズ (gzip後) がFree枠3MB以内に収まることの確認
  - レンダリングのメモリ・レイテンシ実測 (128MB/isolate上限に対する余裕確認)
  - 測定値: バンドル952KB gzip (Free 3MB以内)、レンダリング約30-60ms
  - _Requirements: 1.5_

-
  6. [ ] テストと検証
- [x] 6.1 ユニットテスト
  - gleeunit: クエリパース・バリデーション・レイアウト選択
  - deno test: LumeフックのURL生成 (切り詰め・決定性・RELEASEゲート)
  - _Requirements: 8.1_

- [x] 6.2 ゴールデン画像テスト
  - 固定入力 (日本語タイトル/80字超の説明文/main) からのPNG sha256をコミット
  - CIでの比較実行
  - _Requirements: 8.2_

- [ ] 6.3 デプロイ後の実機検証
  - Facebook Sharing Debugger / X Card Validator でog:image表示確認
  - URL長 (最悪~1.5KB) のクローラ動作確認
  - キャッシュヒット (`cf-cache-status`) とコンテンツ更新時の新URL生成確認
  - ※ 本番デプロイ後に実施するため未完了 (wrangler deploy + DNS自動作成)
  - _Requirements: 8.3, 2.4_
