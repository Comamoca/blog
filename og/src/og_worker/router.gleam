//// hinoto Worker のルーティングとHTTP層。
////
//// - `GET /og.png?l=<post|main>&t=<title>&d=<description>` → PNG (immutable)
//// - キャッシュはCloudflare側 (cache-controlヘッダ) で行うため、
////   ワーカー内Cache APIはデフォルト無効 (x-cache: BYPASS)。
////   env `OG_CACHE_API=1` で有効化すると x-cache: MISS/HIT で動作する
//// - 不正パラメータ → 400、レンダリング失敗 → 500、その他 → 404

import gleam/http.{Get}
import gleam/http/request.{type Request}
import gleam/http/response.{type Response}
import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option, None, Some}
import gleam/uri
import hinoto/body.{type Body, BitArrayBody, StringBody}
import hinoto/runtime/workers.{type WorkersContext}
import og_worker/render.{Render, Svg}
import og_worker/request as og_request

pub fn handle(
  req: Request(Body),
  ctx: WorkersContext,
) -> Promise(Response(Body)) {
  case req.method, request.path_segments(req) {
    Get, ["og.png"] -> serve_og(req, ctx)
    _, _ -> promise.resolve(text_response(404, "not found"))
  }
}

fn serve_og(
  req: Request(Body),
  ctx: WorkersContext,
) -> Promise(Response(Body)) {
  let url = request.to_uri(req) |> uri.to_string
  case request.get_query(req) {
    Error(_) -> promise.resolve(text_response(400, "invalid query string"))
    Ok(pairs) ->
      case og_request.parse_query(pairs) {
        Error(error) ->
          promise.resolve(text_response(400, describe_error(error)))
        Ok(og_req) -> serve_cached(url, og_req, ctx)
      }
  }
}

fn serve_cached(
  url: String,
  og_req: og_request.OgpRequest,
  ctx: WorkersContext,
) -> Promise(Response(Body)) {
  use enabled <- promise.await(cache_enabled(ctx))
  case enabled {
    False -> generate(url, og_req, ctx, use_cache: False)
    True -> {
      use cached <- promise.await(match_cache(ctx, url))
      case cached {
        Some(bits) -> promise.resolve(png_response(bits, "HIT"))
        None -> generate(url, og_req, ctx, use_cache: True)
      }
    }
  }
}

fn generate(
  url: String,
  og_req: og_request.OgpRequest,
  ctx: WorkersContext,
  use_cache use_cache: Bool,
) -> Promise(Response(Body)) {
  use fonts <- promise.await(load_fonts(ctx))
  use background <- promise.await(load_asset(ctx, "/img/gakumas-sozai.png"))
  use icon <- promise.await(load_asset(ctx, "/img/icon.png"))
  use result <- promise.await(render.render_og(og_req, fonts, background, icon))
  case result {
    Ok(bits) -> {
      use _ <- promise.await(case use_cache {
        True -> put_cache(ctx, url, bits)
        False -> promise.resolve(Nil)
      })
      promise.resolve(png_response(bits, cache_status(use_cache)))
    }
    Error(Svg(message)) ->
      promise.resolve(text_response(500, "svg error: " <> message))
    Error(Render(message)) ->
      promise.resolve(text_response(500, "render error: " <> message))
  }
}

fn cache_status(use_cache: Bool) -> String {
  case use_cache {
    True -> "MISS"
    False -> "BYPASS"
  }
}

fn png_response(bits: BitArray, cache_status: String) -> Response(Body) {
  response.new(200)
  |> response.set_header("content-type", "image/png")
  |> response.set_header("cache-control", "public, max-age=31536000, immutable")
  |> response.set_header("x-cache", cache_status)
  |> response.set_body(BitArrayBody(bits))
}

fn load_fonts(ctx: WorkersContext) -> Promise(List(BitArray)) {
  use regular <- promise.await(load_asset(ctx, "/fonts/NotoSansJP-Regular.ttf"))
  use bold <- promise.await(load_asset(ctx, "/fonts/NotoSansJP-Bold.ttf"))
  promise.resolve([regular, bold])
}

@external(javascript, "./interop/assets.mjs", "fetch_asset_bytes")
fn load_asset(ctx: WorkersContext, path: String) -> Promise(BitArray)

@external(javascript, "./interop/cache.mjs", "cache_enabled")
fn cache_enabled(ctx: WorkersContext) -> Promise(Bool)

@external(javascript, "./interop/cache.mjs", "match_cache")
fn match_cache(ctx: WorkersContext, url: String) -> Promise(Option(BitArray))

@external(javascript, "./interop/cache.mjs", "put_cache")
fn put_cache(ctx: WorkersContext, url: String, bits: BitArray) -> Promise(Nil)

fn describe_error(error: og_request.ParseError) -> String {
  case error {
    og_request.MissingLayout -> "missing required parameter: l"
    og_request.InvalidLayout(value) -> "invalid layout: " <> value
    og_request.MissingTitle -> "missing required parameter: t"
  }
}

fn text_response(status: Int, message: String) -> Response(Body) {
  response.new(status)
  |> response.set_header("content-type", "text/plain; charset=utf-8")
  |> response.set_body(StringBody(message))
}
