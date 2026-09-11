# Requirements Document

## Introduction

本ブログ (comamoca.dev) のOGP画像は、現在Lumeのビルドプロセス内でsatori + sharp
(resvg-wasm) により生成されている。Noto Sans CJK JPのフルOTF (~16MB×2)
の読み込みとsatoriによるレンダリングが ビルド時間のネックになっている。

本仕様では、OGP画像の生成をCloudflare Workers (Gleam実装)
に移行し、リクエスト時に動的生成する
ことでビルドから画像生成を分離する。実装はGleam + comamoca/hinoto
(Workersランタイム) を用い、 描画は Lustre → HTML → komeiji (HTML→SVG) →
resvg-wasm (SVG→PNG) のパイプラインで行う。

## Requirements

### Requirement 1: OG画像の動的生成エンドポイント

**Objective:**
SNSクローラおよびサイト利用者として、記事に対応するOGP画像を常に取得できることを望む

#### Acceptance Criteria

1. WHEN `GET https://og.comamoca.dev/og.png` に `l` (レイアウト) と `t`
   (タイトル) を クエリパラメータで渡す THEN 1200×600のPNG画像を返すこと
2. WHEN `l=post` で `d` (説明文) が指定されている THEN 記事用カードレイアウト
   (タイトル + 説明文 + フッター) で描画すること
3. WHEN `l=main` が指定されている THEN
   サイト名を大きく表示するメインレイアウトで描画すること
4. WHEN 同一パラメータのリクエストが繰り返される THEN 同一の画像が返されること
   (決定的レンダリング)
5. IF キャッシュにヒットしない THEN Worker上で動的にレンダリングして返すこと

### Requirement 2: コンテンツアドレス型URLとキャッシュ

**Objective:**
サイト管理者として、キャッシュが正しく機能し、コンテンツ更新時に古い画像が表示されないことを望む

#### Acceptance Criteria

1. WHEN og:imageのURLが生成される THEN
   title/descriptionがクエリパラメータに含まれ、
   コンテンツに決定的なURLになること
2. WHEN 画像レスポンスを返す THEN
   `Cache-Control: public, max-age=31536000, immutable` を設定すること
3. WHEN 画像をレンダリングした THEN Cache APIに保存し、後続の同一URLリクエストで
   再レンダリングを回避すること
4. WHEN 記事のtitle/descriptionが変更される THEN og:imageのURLが変化し、
   新しい画像が生成されること (デプロイ時のpurge不要)
5. IF 説明文が切り詰められている THEN 切り詰め後の文字列がURLに含まれること

### Requirement 3: Lume側のog:imageメタタグ生成

**Objective:**
サイト管理者として、ビルド時に各ページのog:imageをWorkerのURLとして出力したい

#### Acceptance Criteria

1. WHEN `ogLayout` を持つページがビルドされる THEN `metas.image` に
   `https://og.comamoca.dev/og.png?l=...&t=...&d=...` を設定すること
2. WHEN メタタグが出力される THEN og:imageが絶対URLであること
3. WHEN 説明文が80文字を超える THEN 80文字で切り詰めて「…」を付与すること (旧
   `postOgImage.tsx` の `MAX_DESCRIPTION_LENGTH` の挙動を移植)
4. WHEN 同一コンテンツからURLを生成する THEN
   常に同一のエンコード・同一のURLが得られること
5. IF `RELEASE` 環境変数が設定されていない THEN
   フックは動作せず、現行の開発環境と同じ挙動を維持すること

### Requirement 4: ビルド時OG画像生成の完全撤去

**Objective:** サイト管理者として、ビルド時間を短縮し、描画コードを単一化したい

#### Acceptance Criteria

1. WHEN `RELEASE=1` でビルドする THEN satori / sharp /
   og_imagesプラグインによるOG画像生成を実行しないこと
2. WHEN ビルドする THEN `_site` にOG画像のPNGを出力しないこと
3. WHEN 旧実装を削除する THEN `src/_includes/layouts/postOgImage.tsx` と
   `mainOgImage.tsx` のデザインをLustre実装に移植した上でファイルを削除すること
4. WHEN CIを実行する THEN `_cache` のOG画像キャッシュ制御を廃止すること

### Requirement 5: 描画パイプライン (Gleam)

**Objective:** 開発者として、GleamのエコシステムでOG画像を描画したい

#### Acceptance Criteria

1. WHEN 画像を描画する THEN Lustre element → `element.to_string` → komeiji
   (HTML→SVG) → resvg-wasm (SVG→PNG) の順で処理すること
2. WHEN resvg-wasmを使用する THEN esbuildによりプリコンパイルされた静的WASM
   import 経由で初期化すること (Workersは動的WASMコンパイルを禁止するため)
3. WHEN フォントを読み込む THEN サブセット化したNoto Sans CJK JP (Regular/Bold)
   を WorkerのStatic Assetsから取得し、isolate内でキャッシュすること
4. WHEN 背景画像・アイコンを使用する THEN SVGにdata URIとして埋め込むこと
5. WHEN 日本語テキストを描画する THEN 適切に折り返されること (komeijiの責務)

### Requirement 6: デプロイと環境構成

**Objective:** サイト管理者として、サイトとWorkerを独立してデプロイ・運用したい

#### Acceptance Criteria

1. WHEN Workerをデプロイする THEN `og.comamoca.dev`
   カスタムドメインで公開すること
2. WHEN サイトのみを再デプロイする THEN Workerの再デプロイを不要にすること
   (Workerはステートレス)
3. WHEN 描画コードを変更した場合のみ Workerを再デプロイすること
4. WHEN ローカルで開発する THEN `wrangler dev`
   でWorkerとAssetsの動作を確認できること

### Requirement 7: エラーハンドリング

**Objective:**
開発者として、不正なリクエストやレンダリング失敗時にシステムが安定動作することを望む

#### Acceptance Criteria

1. WHEN 必須パラメータ (`t`, `l`) が欠落または不正な値 THEN 400を返すこと
2. WHEN レンダリングが失敗する THEN 500を返し、エラー内容をログに記録すること
3. WHEN レンダリング中に例外が発生する THEN Workerのisolateがクラッシュせず
   エラーレスポンスを返すこと

### Requirement 8: テストと検証

**Objective:** 開発者として、OG画像の品質とリグレッションを継続的に検証したい

#### Acceptance Criteria

1. WHEN ユニットテストを実行する THEN パラメータ解析・レイアウト選択・URL生成
   (Lume側) が検証されること
2. WHEN ゴールデン画像テストを実行する THEN 固定入力から生成したPNGのハッシュが
   期待値と一致すること
3. WHEN デプロイ後の検証を行う THEN Facebook Sharing Debugger / X Card Validator
   で og:imageが正しく表示されること
