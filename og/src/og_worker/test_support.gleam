//// node環境 (gleam test) 専用のテストサポート。
//// 本番Workerのimportグラフには含まれない。

import gleam/javascript/promise.{type Promise}

@external(javascript, "./interop/node_ffi.mjs", "setup_resvg")
pub fn setup_resvg() -> Nil

@external(javascript, "./interop/node_ffi.mjs", "load_file_bytes")
pub fn load_file_bytes(path: String) -> BitArray

@external(javascript, "./interop/node_ffi.mjs", "sha256_hex")
pub fn sha256_hex(bits: BitArray) -> String

/// resvg-wasmの初期化 (テスト用の明示的初期化)
pub fn init() -> Promise(Nil) {
  png.ensure_init()
}

import og_worker/png
