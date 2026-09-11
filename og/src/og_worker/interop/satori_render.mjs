/**
 * komeiji + satori による HTML→SVG 変換。
 * komeiji がHTML文字列をsatori互換VDOMに変換し、satori (Yogaレイアウト)
 * がSVGを生成する。文字折り返し・CJK改行はsatoriの責務。
 *
 * satori/komeiji は動的importで初回リクエスト時に評価する
 * (emscriptenのランタイム初期化をグローバルスコープで行わないため)。
 * yogaのwasmは satori.init() にプリコンパイル済みモジュールを渡す
 * (Workersは動的WASMコンパイルを禁止するため。design.md参照)。
 */
import { Ok as GleamOk, Error as GleamError } from "../../../prelude.mjs";

let yogaWasmModule = null;

// yoga.wasm: Workers は静的import相当 (CompiledWasm) / node はfsから読む
async function loadYogaWasm() {
  try {
    const mod = await import("satori/yoga.wasm");
    return mod.default;
  } catch {
    const { readFileSync } = await import("node:fs");
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    const path = require.resolve("satori/yoga.wasm");
    return new Uint8Array(readFileSync(path));
  }
}

const font_family = "Noto Sans JP";
const weights = [400, 700];

let yogaReady = null;

function toUint8Array(bitArray) {
  if (bitArray instanceof Uint8Array) return bitArray;
  const start = (bitArray.bitOffset ?? 0) >> 3;
  const length = bitArray.byteSize ?? bitArray.rawBuffer.length;
  return bitArray.rawBuffer.slice(start, start + length);
}

export async function html_to_svg(markup, fonts, width, height) {
  try {
    const [{ html }, satoriMod] = await Promise.all([
      import("@comamoca/komeiji"),
      import("satori"),
    ]);
    if (!yogaReady) {
      if (!yogaWasmModule) {
        yogaWasmModule = await loadYogaWasm();
      }
      yogaReady = satoriMod.init(yogaWasmModule);
    }
    await yogaReady;
    const faces = fonts
      .toArray()
      .map(toUint8Array)
      .map((data, index) => ({
        name: font_family,
        data,
        weight: weights[index] ?? 400,
        style: "normal",
      }));
    const svg = await satoriMod.default(html(markup), {
      width,
      height,
      fonts: faces,
    });
    return new GleamOk(svg);
  } catch (e) {
    return new GleamError(
      e && e.stack ? String(e.stack).slice(0, 2000) : String(e),
    );
  }
}
