/**
 * @resvg/resvg-js の Workers 互換 shim (wrangler.toml の [alias] で差し替え)。
 *
 * koishi の SVG→PNG 変換は resvg-js を import するが、resvg-js は
 * プラットフォーム毎のネイティブ (napi) バイナリを読むため workerd では
 * 動作しない。koishi が使うAPIは `new Resvg(svg, options)` →
 * `.render().asPng()` のみで、これは同じ resvg (Rust) のwasmビルドである
 * resvg-wasm と同形なので、Resvg をそのまま再公開する。
 *
 * resvg-wasm は initWasm() の解決前に Resvg を構築できないため、
 * 初期化は entry (src/index.js) が fetch 前に await する。
 */
export { Resvg } from "@resvg/resvg-wasm";
