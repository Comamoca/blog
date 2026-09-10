/**
 * Cloudflare Workers エントリ (hinoto example/workers 準拠)。
 *
 * - Gleamは src/ 内の .js をビルド出力へコピーするため、
 *   このファイルは build/dev/javascript/og_worker/index.js として配置される
 *   (wrangler.toml の main が直接参照する)
 * - resvg-wasm は静的importし、esbuild (wrangler) にプリコンパイルさせる
 *   (Workersは動的WASMコンパイルを禁止するため。design.md参照)
 * - hinotoのHinotoコンテキストには ASSETS binding を持つ env を渡す
 * - setup_env.mjs は satori/harfbuzzjs の評価前に実行される必要があるため
 *   必ず最初にimportする
 */
import "./setup_env.mjs";
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import { main } from "./og_worker.mjs";

globalThis.__OG_WORKER_RESVG_WASM__ = wasmModule;

export default {
  async fetch(req, env, ctx) {
    globalThis.__OG_ENV__ = env;
    return await main()(req, env);
  },
};
