/**
 * Cloudflare Workers エントリ (hinoto example/workers 準拠)。
 *
 * - Gleamは src/ 内の .js をビルド出力へコピーするため、
 *   このファイルは build/dev/javascript/og_worker/index.js として配置される
 *   (wrangler.toml の main が直接参照する)
 * - resvg-wasm は静的importし、esbuild (wrangler) にプリコンパイルさせる
 *   (Workersは動的WASMコンパイルを禁止するため。design.md参照)
 * - koishi の SVG→PNG 変換は resvg-js (ネイティブ) を使うため、wrangler の
 *   alias で resvg-wasm shim に差し替えている (wrangler.toml参照)。
 *   その初期化は initWasm() が解決するまで Resvg を構築できないので、
 *   リクエスト処理の最初に一度だけ await する
 * - hinotoのHinotoコンテキストには ASSETS binding を持つ env を渡す
 * - setup_env.mjs は satori/harfbuzzjs の評価前に実行される必要があるため
 *   必ず最初にimportする
 */
import "./setup_env.mjs";
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import { initWasm } from "@resvg/resvg-wasm";
import { main } from "./og_worker.mjs";

let resvgReady = null;

export default {
  async fetch(req, env, ctx) {
    globalThis.__OG_ENV__ = env;
    resvgReady ??= initWasm(wasmModule);
    await resvgReady;
    return await main()(req, env);
  },
};
