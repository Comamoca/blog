//// komeiji + satori による HTML→SVG 変換 (JS FFI)。
//// komeiji がHTML文字列をsatori互換VDOMに変換し、satori (Yogaレイアウト)
//// がSVGを生成する。文字折り返し・CJK改行はsatoriの責務。

import gleam/javascript/promise.{type Promise}

@external(javascript, "./interop/satori_render.mjs", "html_to_svg")
pub fn html_to_svg(
  markup: String,
  fonts: List(BitArray),
  width: Int,
  height: Int,
) -> Promise(Result(String, String))
