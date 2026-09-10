import gleam/option.{None, Some}
import gleeunit
import gleeunit/should
import og_worker/request.{
  InvalidLayout, Main, MissingLayout, MissingTitle, OgpRequest, Post,
}

pub fn main() {
  gleeunit.main()
}

// parse_query: 正常系

pub fn parse_full_post_request_test() {
  request.parse_query([
    #("l", "post"),
    #("t", "GleamでOG画像生成"),
    #("d", "Cloudflare Workersで動的に生成します"),
  ])
  |> should.equal(
    Ok(OgpRequest(Post, "GleamでOG画像生成", Some("Cloudflare Workersで動的に生成します"))),
  )
}

pub fn parse_main_request_without_description_test() {
  request.parse_query([#("l", "main"), #("t", "かわいい駆動生活。")])
  |> should.equal(Ok(OgpRequest(Main, "かわいい駆動生活。", None)))
}

pub fn parse_main_request_with_description_test() {
  request.parse_query([#("l", "main"), #("t", "かわいい駆動生活。"), #("d", "説明")])
  |> should.equal(Ok(OgpRequest(Main, "かわいい駆動生活。", Some("説明"))))
}

// parse_query: バリデーション

pub fn missing_layout_param_test() {
  request.parse_query([#("t", "タイトル")])
  |> should.equal(Error(MissingLayout))
}

pub fn invalid_layout_value_test() {
  request.parse_query([#("l", "hoge"), #("t", "タイトル")])
  |> should.equal(Error(InvalidLayout("hoge")))
}

pub fn missing_title_param_test() {
  request.parse_query([#("l", "post")])
  |> should.equal(Error(MissingTitle))
}

pub fn empty_title_param_test() {
  request.parse_query([#("l", "post"), #("t", "")])
  |> should.equal(Error(MissingTitle))
}

// parse_query: 決定性

pub fn unknown_params_are_ignored_test() {
  request.parse_query([
    #("l", "post"),
    #("t", "タイトル"),
    #("utm_source", "x"),
    #("d", "説明"),
  ])
  |> should.equal(Ok(OgpRequest(Post, "タイトル", Some("説明"))))
}

pub fn duplicate_params_first_wins_test() {
  request.parse_query([#("l", "post"), #("l", "main"), #("t", "タイトル")])
  |> should.equal(Ok(OgpRequest(Post, "タイトル", None)))
}
