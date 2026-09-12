//// フォントカバレッジのテスト: サブセットに含まれない漢字は豆腐 (□) として
//// 描画される。豆腐は字形を持たないため、異なる2文字でも同じ画像になる。
//// つまり「別々の漢字を描いた2枚が別々のPNGになる」ことは、両方の字形が
//// 実際にフォントへ入っていることの観測可能な証拠になる。
////
//// 題材はJIS X 0208 第2水準の漢字 (騙 / 燻)。第2水準はブログの
//// title/description コーパスには現れないため、flake.nixの ogFonts が
//// コーパスだけでサブセットする回帰 (記事追加で未知の漢字が豆腐になる) を
//// 検出できる。

import gleam/javascript/promise.{type Promise}
import gleam/option.{None}
import gleeunit/should
import og_worker/render
import og_worker/request.{OgpRequest, Post}
import og_worker/test_support.{load_file_bytes, sha256_hex}

const jis_level2_a = "騙"

const jis_level2_b = "燻"

fn render_title_sha256(title: String) -> Promise(String) {
  let fonts = [
    load_file_bytes("static/fonts/NotoSansJP-Regular.ttf"),
    load_file_bytes("static/fonts/NotoSansJP-Bold.ttf"),
  ]
  let background = load_file_bytes("static/img/gakumas-sozai.png")
  let icon = load_file_bytes("static/img/icon.png")
  let req = OgpRequest(Post, title, None)
  use result <- promise.await(render.render_og(req, fonts, background, icon))
  promise.resolve(sha256_hex(should.be_ok(result)))
}

pub fn distinct_kanji_render_distinct_glyphs_test() -> Promise(Nil) {
  use a <- promise.await(render_title_sha256(jis_level2_a))
  use b <- promise.await(render_title_sha256(jis_level2_b))
  promise.resolve(should.not_equal(a, b))
}
