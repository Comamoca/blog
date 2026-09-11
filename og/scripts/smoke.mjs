import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const wasmPath = require.resolve("@resvg/resvg-wasm/index_bg.wasm", { paths: ["/home/coma/.ghq/github.com/Comamoca/blog.feat-worker-ogp/og"] });
globalThis.__OG_WORKER_RESVG_WASM__ = new Uint8Array(readFileSync(wasmPath));

const ogRoot = "/home/coma/.ghq/github.com/Comamoca/blog.feat-worker-ogp/og";
const { main } = await import(ogRoot + "/build/dev/javascript/og_worker/og_worker.mjs");

const env = {
  ASSETS: {
    async fetch(input) {
      const path = new URL(input instanceof Request ? input.url : String(input)).pathname;
      const file = ogRoot + "/static" + path;
      try {
        return new Response(readFileSync(file));
      } catch (e) {
        return new Response("missing: " + file, { status: 404 });
      }
    },
  },
};

const req = new Request("http://localhost/og.png?l=main&t=%E3%81%82");
const handler = main();
const result = await handler(req, env);
console.log("type:", result?.constructor?.name);
console.log("is Response:", result instanceof Response);
if (result instanceof Response) {
  console.log("status:", result.status);
  console.log("headers:", [...result.headers]);
  const buf = await result.arrayBuffer();
  console.log("body bytes:", buf.byteLength);
} else {
  console.dir(result, { depth: 6 });
}
