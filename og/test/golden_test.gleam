//// ゴールデン画像テスト: 固定入力からのPNGのsha256を検証する。
//// 期待ハッシュの更新手順: 描画を意図的に変更した場合は
//// `gleam test` の失敗出力に表示されるactualハッシュで定数を更新する。

import gleam/javascript/promise.{type Promise}
import gleam/option.{None, Some}
import gleeunit/should
import og_worker/render
import og_worker/request.{Main, OgpRequest, Post}
import og_worker/test_support.{load_file_bytes, sha256_hex}

const golden_post_sha256 =
  "c545f9b0c7e596d4003d5be64e09d122dcb9353a9512edee9d0bb09d4843b7a8"

const golden_main_sha256 =
  "d4806c198c05cba91c153f4458f45f1b5a079e435bef699095fe5af54c361052"

pub fn render_post_card_golden_test() -> Promise(Nil) {
  let fonts = [
    load_file_bytes("static/fonts/NotoSansJP-Regular.ttf"),
    load_file_bytes("static/fonts/NotoSansJP-Bold.ttf"),
  ]
  let background = load_file_bytes("static/img/gakumas-sozai.png")
  let icon = load_file_bytes("static/img/icon.png")
  let req =
    OgpRequest(
      Post,
      "GleamとCloudflare WorkersでOG画像を動的生成する",
      Some(
        "LustreでHTMLを組み立て、komeijiでSVGに変換し、resvg-wasmでPNGへ描画します。"
        <> "この説明文は折り返しの確認用にやや長めにしています。日本語のテキストが"
        <> "カードの幅に収まることを確認してください。",
      ),
    )
  use result <- promise.await(render.render_og(req, fonts, background, icon))
  let assert Ok(bits) = result
  promise.resolve(sha256_hex(bits) |> should.equal(golden_post_sha256))
}

pub fn render_main_card_golden_test() -> Promise(Nil) {
  let fonts = [
    load_file_bytes("static/fonts/NotoSansJP-Regular.ttf"),
    load_file_bytes("static/fonts/NotoSansJP-Bold.ttf"),
  ]
  let background = load_file_bytes("static/img/gakumas-sozai.png")
  let icon = load_file_bytes("static/img/icon.png")
  let req = OgpRequest(Main, "かわいい駆動生活。", None)
  use result <- promise.await(render.render_og(req, fonts, background, icon))
  let assert Ok(bits) = result
  promise.resolve(sha256_hex(bits) |> should.equal(golden_main_sha256))
}
