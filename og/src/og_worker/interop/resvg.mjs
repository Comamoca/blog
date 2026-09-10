/**
 * resvg-wasm FFI (環境非依存)。
 *
 * Workersでは動的WASMコンパイルが禁止されるため、WASMバイナリは
 * 静的import + esbuildプリコンパイルで WebAssembly.Module にしたものを
 * entry.mjs が globalThis.__OG_WORKER_RESVG_WASM__ に注入する。
 * node (gleam test) では test_support が Uint8Array を注入する。
 */
import { BitArray, Ok as GleamOk, Error as GleamError } from "../../../prelude.mjs";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

let initPromise = null;

function wasmSource() {
  const source = globalThis.__OG_WORKER_RESVG_WASM__;
  if (!source) {
    throw new Error(
      "resvg wasm source is not set: assign globalThis.__OG_WORKER_RESVG_WASM__ (entry.mjs or test support)",
    );
  }
  return source;
}

export function ensure_init() {
  if (!initPromise) {
    initPromise = initWasm(wasmSource());
  }
  return initPromise;
}

function toUint8Array(bitArray) {
  if (bitArray instanceof Uint8Array) return bitArray;
  const start = (bitArray.bitOffset ?? 0) >> 3;
  const length = bitArray.byteSize ?? bitArray.rawBuffer.length;
  return bitArray.rawBuffer.slice(start, start + length);
}

/**
 * SVG文字列をPNGにレンダリングする。
 * @param {string} svg
 * @param {import("../../../prelude.mjs").List} fonts - BitArray (フォントファイル) のGleamリスト
 * @param {number} width
 * @returns {Result} Gleam Result(BitArray, String)
 */
export function render_png(svg, fonts, width) {
  try {
    const fontBuffers = fonts.toArray().map(toUint8Array);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: width },
      font: {
        fontBuffers,
        loadSystemFonts: false,
        defaultFontFamily: "Noto Sans JP",
      },
    });
    const png = resvg.render().asPng();
    return new GleamOk(new BitArray(png));
  } catch (e) {
    return new GleamError(String(e && e.message ? e.message : e));
  }
}
