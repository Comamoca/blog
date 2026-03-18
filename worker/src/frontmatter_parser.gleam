import frontmatter
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub type ArticleMeta {
  ArticleMeta(
    title: String,
    description: String,
    pub_date: String,
    emoji: String,
    tags: List(String),
    draft: Bool,
  )
}

pub type ParseResult {
  ParseResult(meta: Option(ArticleMeta), body: String)
}

pub fn parse(content: String) -> ParseResult {
  let extracted = frontmatter.extract(content)
  case extracted.frontmatter {
    None -> ParseResult(meta: None, body: extracted.content)
    Some(fm) -> ParseResult(meta: Some(parse_meta(fm)), body: extracted.content)
  }
}

fn parse_meta(fm: String) -> ArticleMeta {
  let lines = string.split(fm, "\n")
  ArticleMeta(
    title: get_value(lines, "title"),
    description: get_value(lines, "description"),
    pub_date: get_value(lines, "pubDate"),
    emoji: get_value(lines, "emoji"),
    tags: get_array(lines, "tags"),
    draft: get_value(lines, "draft") == "true",
  )
}

fn get_value(lines: List(String), key: String) -> String {
  lines
  |> list.find_map(fn(line) {
    case string.split_once(string.trim(line), ": ") {
      Ok(#(k, v)) ->
        case k == key {
          True -> Ok(strip_quotes(v))
          False -> Error(Nil)
        }
      Error(_) -> Error(Nil)
    }
  })
  |> option.from_result
  |> option.unwrap("")
}

fn strip_quotes(s: String) -> String {
  let s = string.trim(s)
  case string.starts_with(s, "\"") && string.ends_with(s, "\"") {
    True -> s |> string.drop_start(1) |> string.drop_end(1)
    False -> s
  }
}

fn get_array(lines: List(String), key: String) -> List(String) {
  let raw = get_value(lines, key)
  raw
  |> string.replace("[", "")
  |> string.replace("]", "")
  |> string.split(",")
  |> list.map(fn(s) { s |> string.trim |> strip_quotes })
  |> list.filter(fn(s) { !string.is_empty(s) })
}
