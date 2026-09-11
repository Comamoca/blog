/**
 * 起動時の環境調整 (satoriの依存emscripten対応)。
 *
 * - Workersには location が無いため、emscriptenの参照先として設定する
 * - satori/yogaのwasmロードは `fetch(dataURI, {credentials})` 形式で行われるが
 *   workerdはcredentialsフィールド・data URIを許可しないため、
 *   emscriptenが要求する最小限のインターフェースを持つ擬似Responseを返す
 * - バイト列からのWebAssembly.instantiate / harfbuzzjsのaddFunction内部の
 *   WebAssembly.Module生成は動的コンパイル禁止で失敗するため、
 *   静的import済みのモジュール (yoga.wasm / shims/*.wasm) へ差し替える
 * - workerdのinstantiateはInstanceを直接返すため、emscriptenが期待する
 *   {instance} 形へ正規化する
 */
import yogaWasmModule from "satori/yoga.wasm";
import shimVi from "og-wasm-shims/vi.wasm";
import shimViiiffi from "og-wasm-shims/viiiffi.wasm";
import shimViiiffffffi from "og-wasm-shims/viiiffffffi.wasm";
import shimViiiffffi from "og-wasm-shims/viiiffffi.wasm";
import shimViiii from "og-wasm-shims/viiii.wasm";

globalThis.location = { href: "https://og.comamoca.dev/" };

const ogFetch = globalThis.fetch.bind(globalThis);

function dataUriFakeResponse(uri) {
  const meta = uri.slice(5, uri.indexOf(","));
  const data = uri.slice(uri.indexOf(",") + 1);
  const body = meta.includes("base64")
    ? Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(data));
  return {
    ok: true,
    status: 200,
    arrayBuffer: () => Promise.resolve(body.buffer.slice(body.byteOffset)),
  };
}

const ogInstantiate = WebAssembly.instantiate.bind(WebAssembly);

function normalize(result, source) {
  return Promise.resolve(result).then((resolved) => {
    if (resolved instanceof WebAssembly.Instance) {
      return { module: source, instance: resolved };
    }
    return resolved;
  });
}

globalThis.fetch = (input, init) => {
  const url = typeof input === "string"
    ? input
    : input instanceof URL
    ? input.href
    : input && input.url;
  if (typeof url === "string" && url.startsWith("data:")) {
    return Promise.resolve(dataUriFakeResponse(url));
  }
  if (init && "credentials" in init) {
    const { credentials, ...rest } = init;
    return normalize(ogFetch(input, rest), input);
  }
  return normalize(ogFetch(input, init), input);
};

WebAssembly.instantiate = (source, imports) => {
  if (
    (source instanceof Uint8Array || source instanceof ArrayBuffer) &&
    imports
  ) {
    return normalize(ogInstantiate(yogaWasmModule, imports), yogaWasmModule);
  }
  return normalize(ogInstantiate(source, imports), source);
};

// --- harfbuzzjs addFunction用 js-to-wasm shim の事前コンパイル供給 ---
const ogModule = WebAssembly.Module;
const shimCache = new Map();

const wasmTypeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
const uleb128EncodeWithLen = (arr) => {
  const n = arr.length;
  return [n % 128 | 128, n >> 7, ...arr];
};
const generateTypePack = (types) =>
  uleb128EncodeWithLen(Array.from(types, (type) => wasmTypeCodes[type]));
const generateShimBytes = (sig) =>
  Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0, 1,
    ...uleb128EncodeWithLen([
      1, 96,
      ...generateTypePack(sig.slice(1)),
      ...generateTypePack(sig[0] === "v" ? "" : sig[0]),
    ]),
    2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);

const shimModules = {
  vi: shimVi,
  viiiffi: shimViiiffi,
  viiiffffffi: shimViiiffffffi,
  viiiffffi: shimViiiffffi,
  viiii: shimViiii,
};
for (const [sig, module] of Object.entries(shimModules)) {
  const bytes = generateShimBytes(sig);
  shimCache.set(String.fromCharCode(...bytes), module);
}

WebAssembly.Module = function (binary, options) {
  if (binary instanceof Uint8Array && binary.length < 128) {
    const key = String.fromCharCode(...binary);
    const cached = shimCache.get(key);
    if (cached) return cached;
    return new ogModule(binary, options);
  }
  return new ogModule(binary, options);
};
WebAssembly.Module.prototype = ogModule.prototype;
Object.setPrototypeOf(WebAssembly.Module, ogModule);
