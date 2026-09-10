//// resvg-wasm のFFIラッパ。
//// WASMソースは entry.mjs (Workers) / test_support (node) が注入する。

import gleam/javascript/promise.{type Promise}

@external(javascript, "./interop/resvg.mjs", "ensure_init")
pub fn ensure_init() -> Promise(Nil)

@external(javascript, "./interop/resvg.mjs", "render_png")
pub fn render_png(
  svg: String,
  fonts: List(BitArray),
  width: Int,
) -> Result(BitArray, String)
