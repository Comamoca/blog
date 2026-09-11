//// OGPカードのLustre element (旧 postOgImage.tsx / mainOgImage.tsx の移植)。
//// このHTMLがkomeiji (HTML→satori VDOM) への入力となる。

import gleam/option.{None, Some}
import lustre/attribute
import lustre/element.{type Element, text}
import lustre/element/html
import og_worker/assets.{type Assets}
import og_worker/request.{type OgpRequest, Main, Post}

pub const site_title = "かわいい駆動生活。"

pub fn render(req: OgpRequest, assets: Assets) -> Element(Nil) {
  html.div(
    [
      attribute.styles([
        #("width", "100%"),
        #("height", "100%"),
        #("display", "flex"),
        #("justify-content", "center"),
        #("align-items", "center"),
        #("background-image", "url(" <> assets.background_data_uri <> ")"),
        #("background-position", "center"),
        #("background-repeat", "no-repeat"),
        #("background-size", "cover"),
      ]),
    ],
    [
      case req.layout {
        Main -> main_tree()
        Post -> post_tree(req, assets)
      },
    ],
  )
}

// --- postカード (旧 postOgImage.tsx) ---

fn post_tree(req: OgpRequest, assets: Assets) -> Element(Nil) {
  let desc = case req.description {
    Some(d) -> [
      html.div(
        [
          attribute.styles([
            #("display", "flex"),
            #("font-size", "32px"),
            #("padding-top", "20px"),
            #("color", "#4b5563"),
          ]),
        ],
        [text(d)],
      ),
    ]
    None -> []
  }
  html.div(
    [
      attribute.styles([
        #("display", "flex"),
        #("flex-direction", "column"),
        #("margin", "auto"),
        #("background-color", "#fff"),
        #("width", "85%"),
        #("height", "85%"),
        #("border-radius", "30px"),
      ]),
    ],
    [
      html.div(
        [
          attribute.styles([
            #("display", "flex"),
            #("flex-direction", "column"),
            #("padding", "40px"),
            #("flex-grow", "2"),
          ]),
        ],
        [
          html.div(
            [attribute.styles([#("display", "flex"), #("font-size", "55px")])],
            [text(req.title)],
          ),
          ..desc
        ],
      ),
      footer(assets),
    ],
  )
}

fn footer(assets: Assets) -> Element(Nil) {
  html.div(
    [attribute.styles([#("display", "flex"), #("padding-bottom", "48px")])],
    [
      html.div(
        [
          attribute.styles([
            #("display", "flex"),
            #("flex-grow", "2"),
            #("padding-left", "40px"),
          ]),
        ],
        [
          html.img([
            attribute.attribute("src", assets.icon_data_uri),
            attribute.styles([
              #("width", "80px"),
              #("height", "80px"),
              #("border-radius", "9999px"),
            ]),
          ]),
          html.span(
            [
              attribute.styles([
                #("font-size", "46px"),
                #("font-weight", "700"),
                #("padding-left", "20px"),
                #("padding-top", "10px"),
              ]),
            ],
            [text("Comamoca")],
          ),
        ],
      ),
      html.span(
        [
          attribute.styles([
            #("font-size", "40px"),
            #("font-weight", "700"),
            #("padding-top", "20px"),
            #("padding-right", "30px"),
          ]),
        ],
        [text(site_title)],
      ),
    ],
  )
}

// --- mainカード (旧 mainOgImage.tsx) ---

fn main_tree() -> Element(Nil) {
  html.div(
    [
      attribute.styles([
        #("display", "flex"),
        #("flex-direction", "column"),
        #("margin", "auto"),
        #("background-color", "#fff"),
        #("width", "85%"),
        #("height", "85%"),
        #("border-radius", "30px"),
      ]),
    ],
    [
      html.div(
        [
          attribute.styles([
            #("margin", "auto"),
            #("padding-left", "70px"),
            #("font-size", "80px"),
            #("font-weight", "700"),
            #("text-align", "center"),
          ]),
        ],
        [text(site_title)],
      ),
    ],
  )
}
