//// OGP画像の描画パイプライン。
//// OgpRequest → Lustre element → koishi (SVG) → resvg-wasm (PNG)

import gleam/bit_array
import gleam/javascript/promise.{type Promise}
import gleam/list
import koishi
import koishi/lustre as koishi_lustre
import og_worker/assets.{Assets}
import og_worker/card
import og_worker/png
import og_worker/request.{type OgpRequest}

pub type RenderError {
  /// HTML→SVG変換の失敗 (koishi)
  Svg(String)
  /// SVG→PNG描画の失敗 (resvg)
  Render(String)
}

const image_width = 1200

const image_height = 600

const font_family = "Noto Sans JP"

const font_weights = [400, 700]

pub fn render_og(
  req: OgpRequest,
  fonts: List(BitArray),
  background_png: BitArray,
  icon_png: BitArray,
) -> Promise(Result(BitArray, RenderError)) {
  let image_assets =
    Assets(
      background_data_uri: png_data_uri(background_png),
      icon_data_uri: png_data_uri(icon_png),
    )
  let options =
    koishi.Options(
      width: image_width,
      height: image_height,
      fonts: to_koishi_fonts(fonts),
      debug: False,
    )
  use svg_result <- promise.await(koishi_lustre.to_svg(
    card.render(req, image_assets),
    options,
  ))
  case svg_result {
    Error(koishi.SatoriError(message)) -> promise.resolve(Error(Svg(message)))
    Ok(svg) -> render_svg(svg, fonts)
  }
}

fn to_koishi_fonts(fonts: List(BitArray)) -> List(koishi.Font) {
  list.index_map(fonts, fn(data, index) {
    let weight = case list.drop(font_weights, index) {
      [w, ..] -> w
      [] -> 400
    }
    koishi.Font(font_family, data, weight, koishi.NormalStyle)
  })
}

fn render_svg(
  svg: String,
  fonts: List(BitArray),
) -> Promise(Result(BitArray, RenderError)) {
  use _ <- promise.await(png.ensure_init())
  case png.render_png(svg, fonts, image_width) {
    Ok(bits) -> promise.resolve(Ok(bits))
    Error(message) -> promise.resolve(Error(Render(message)))
  }
}

fn png_data_uri(bits: BitArray) -> String {
  "data:image/png;base64," <> bit_array.base64_encode(bits, True)
}
