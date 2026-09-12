//// node環境 (gleam test) 専用のテストサポート。
//// 本番Workerのimportグラフには含まれない。

@external(javascript, "./interop/node_ffi.mjs", "load_file_bytes")
pub fn load_file_bytes(path: String) -> BitArray

@external(javascript, "./interop/node_ffi.mjs", "sha256_hex")
pub fn sha256_hex(bits: BitArray) -> String
