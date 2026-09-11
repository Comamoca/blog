/**
 * harfbuzzjs (emscripten) の Workers 互換 shim。
 *
 * 本家 index.js は module scope で hb() を呼び、emscripten は
 * ENVIRONMENT_IS_WORKER 判定で self.location.href を読む。
 * workerd には self.location が無いため初期化 Promise が必ず reject し、
 * satori はその rejected promise をキャッシュするため恒久故障になる。
 *
 * この shim は:
 * - self.location を事前に用意する (環境判定の参照のみに使い、fetchには使わない)
 * - hb.wasm を esbuild にプリコンパイルさせ (resvg と同じ静的import)、
 *   instantiateWasm フックで WebAssembly.Module を直接渡す (fetch不要)
 * - 本家と同じ契約 (default export = Promise<hbjs>) を守る
 */
import hbFactory from "./hb.cjs";
import hbjsFactory from "./hbjs.cjs";
import hbWasmModule from "./hb.wasm";

if (typeof self !== "undefined" && typeof self.location === "undefined") {
  self.location = { href: "file:///harfbuzz/" };
}

const ready = hbFactory({
  instantiateWasm(imports, successCallback) {
    const instance = new WebAssembly.Instance(hbWasmModule, imports);
    successCallback(instance, hbWasmModule);
    return instance.exports;
  },
}).then((hb) => hbjsFactory(hb));

export default ready;
