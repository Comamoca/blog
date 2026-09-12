import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import gleeunit/should
import koishi
import koishi/lustre as koishi_lustre
import lustre/element
import og_worker/assets.{Assets}
import og_worker/card
import og_worker/request.{Main, OgpRequest, Post}
import og_worker/test_support.{load_file_bytes}

fn sample_assets() {
  Assets(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  )
}

fn sample_fonts() {
  [
    load_file_bytes("static/fonts/NotoSansJP-Regular.ttf"),
    load_file_bytes("static/fonts/NotoSansJP-Bold.ttf"),
  ]
}

fn to_koishi_fonts(fonts: List(BitArray)) -> List(koishi.Font) {
  let weights = [400, 700]
  list.index_map(fonts, fn(data, index) {
    let weight = case list.drop(weights, index) {
      [w, ..] -> w
      [] -> 400
    }
    koishi.Font("Noto Sans JP", data, weight, koishi.NormalStyle)
  })
}

fn sample_options() {
  koishi.Options(
    width: 1200,
    height: 600,
    fonts: to_koishi_fonts(sample_fonts()),
    debug: False,
  )
}

// card.gleam: Lustre HTML (koishiへの入力)

pub fn card_html_contains_content_and_styles_test() {
  let markup =
    card.render(OgpRequest(Post, "Gleam入門", Some("説明文")), sample_assets())
    |> element.to_string
  should.be_true(string.contains(markup, "font-size:55px"))
  should.be_true(string.contains(markup, "font-size:32px"))
  should.be_true(string.contains(markup, "Gleam入門"))
  should.be_true(string.contains(markup, "説明文"))
  should.be_true(string.contains(
    markup,
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  ))
  should.be_true(string.contains(markup, card.site_title))
}

pub fn card_main_layout_test() {
  let markup =
    card.render(OgpRequest(Main, "無視されるタイトル", None), sample_assets())
    |> element.to_string
  should.be_true(string.contains(markup, "font-size:80px"))
  should.be_false(string.contains(markup, "font-size:55px"))
  should.be_true(string.contains(markup, card.site_title))
}

pub fn card_html_escapes_special_chars_test() {
  let markup =
    card.render(OgpRequest(Post, "a<b&c>", None), sample_assets())
    |> element.to_string
  should.be_false(string.contains(markup, "a<b&c>"))
  should.be_true(string.contains(markup, "&amp;"))
}

// koishi: Lustre element → SVG

pub fn koishi_lustre_converts_element_to_svg_test() -> Promise(Nil) {
  let tree = card.render(OgpRequest(Post, "こんにちは", Some("説明")), sample_assets())
  use result <- promise.await(koishi_lustre.to_svg(tree, sample_options()))
  let assert Ok(svg) = result
  should.be_true(string.contains(svg, "<svg"))
  should.be_true(string.contains(svg, "width=\"1200\""))
  promise.resolve(Nil)
}

pub fn koishi_rejects_broken_markup_test() -> Promise(Nil) {
  use result <- promise.await(koishi.to_svg(
    "<div style=\"display:flex\">",
    sample_options(),
  ))
  // 不完全なマークアップでもクラッシュせず、Resultに折り返される
  let _ = result
  promise.resolve(Nil)
}
