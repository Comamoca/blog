import gleam/dynamic/decode
import gleam/json

pub type ArticleEntry {
  ArticleEntry(
    slug: String,
    title: String,
    pub_date: String,
    emoji: String,
    tags: List(String),
    draft: Bool,
  )
}

fn entry_decoder() -> decode.Decoder(ArticleEntry) {
  use slug <- decode.field("slug", decode.string)
  use title <- decode.field("title", decode.string)
  use pub_date <- decode.field("pub_date", decode.string)
  use emoji <- decode.field("emoji", decode.string)
  use tags <- decode.field("tags", decode.list(decode.string))
  use draft <- decode.field("draft", decode.bool)
  decode.success(ArticleEntry(slug:, title:, pub_date:, emoji:, tags:, draft:))
}

pub fn decode(json_str: String) -> List(ArticleEntry) {
  case json.parse(json_str, decode.list(entry_decoder())) {
    Ok(entries) -> entries
    Error(_) -> []
  }
}
