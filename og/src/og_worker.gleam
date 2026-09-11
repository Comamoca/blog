//// comamoca.dev 用OG画像生成Workerのエントリ。
//// hinoto の Cloudflare Workers ランタイムで起動し、
//// wranglerは entry.mjs 経由で `main` を `export default { fetch }` に接続する。

import gleam/javascript/promise
import hinoto
import hinoto/runtime/workers
import og_worker/router

pub fn main() {
  workers.serve(fn(h) {
    let ctx = h.context
    use h <- promise.await(
      h |> hinoto.handle(fn(req) { router.handle(req, ctx) }),
    )
    promise.resolve(h)
  })
}
