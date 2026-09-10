//// og:image リクエストのクエリパラメータ解析とバリデーション。
////
//// URL仕様: `/og.png?l=<post|main>&t=<title>&d=<description>`
//// - `l`: 必須。`post` または `main`
//// - `t`: 必須。空文字は不可
//// - `d`: 任意。説明文 (Lumeフック側で80字に切り詰め済み)
////
//// 同名パラメータが複数ある場合は最初の値を採用する (決定的)。

import gleam/list
import gleam/option.{type Option}

pub type Layout {
  Post
  Main
}

pub type ParseError {
  /// `l` パラメータが欠落
  MissingLayout
  /// `l` の値が `post` / `main` 以外
  InvalidLayout(String)
  /// `t` パラメータが欠落または空
  MissingTitle
}

pub type OgpRequest {
  OgpRequest(layout: Layout, title: String, description: Option(String))
}

pub fn parse_query(
  params: List(#(String, String)),
) -> Result(OgpRequest, ParseError) {
  case lookup(params, "l") {
    Error(_) -> Error(MissingLayout)
    Ok("post") -> parse_title(params, Post)
    Ok("main") -> parse_title(params, Main)
    Ok(other) -> Error(InvalidLayout(other))
  }
}

fn parse_title(params: List(#(String, String)), layout: Layout) {
  case lookup(params, "t") {
    Error(_) -> Error(MissingTitle)
    Ok("") -> Error(MissingTitle)
    Ok(title) ->
      Ok(OgpRequest(
        layout,
        title,
        params
          |> lookup("d")
          |> option.from_result,
      ))
  }
}

fn lookup(params: List(#(String, String)), key: String) -> Result(String, Nil) {
  list.key_find(params, key)
}
