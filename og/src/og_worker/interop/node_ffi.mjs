/**
 * node環境専用FFI (gleam test / ローカル検証用)。
 * Workersバンドルには含まれない (workerのimportグラフに存在しないため)。
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { BitArray } from "../../../prelude.mjs";

const require = createRequire(import.meta.url);

/**
 * @param {string} path - プロジェクトルート (og/) 相対パス
 * @returns {BitArray}
 */
export function load_file_bytes(path) {
  return new BitArray(new Uint8Array(readFileSync(path)));
}

/**
 * @param {BitArray} bits
 * @returns {string} sha256 hex
 */
export function sha256_hex(bits) {
  const crypto = require("node:crypto");
  const start = (bits.bitOffset ?? 0) >> 3;
  const length = bits.byteSize ?? bits.rawBuffer.length;
  const bytes = bits.rawBuffer.slice(start, start + length);
  return crypto.createHash("sha256").update(bytes).digest("hex");
}
