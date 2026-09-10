//// OGP画像の描画パイプライン。
//// OgpRequest → Lustre HTML → komeiji (SVG) → resvg-wasm (PNG)

import gleam/bit_array
import gleam/javascript/promise.{type Promise}
import lustre/element
import og_worker/assets.{Assets}
import og_worker/card
import og_worker/komeiji
import og_worker/png
import og_worker/request.{type OgpRequest}

pub type RenderError {
  /// HTML→SVG変換の失敗 (komeiji)
  Svg(String)
  /// SVG→PNG描画の失敗 (resvg)
  Render(String)
}

const image_width = 1200

const image_height = 600

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
  let markup = element.to_string(card.render(req, image_assets))
  use svg_result <- promise.await(komeiji.html_to_svg(
    markup,
    fonts,
    image_width,
    image_height,
  ))
  case svg_result {
    Error(message) -> promise.resolve(Error(Svg(message)))
    Ok(svg) -> render_svg(svg, fonts)
  }
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
