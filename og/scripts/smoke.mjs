/**
 * ローカルスモークテスト: ビルド済みworkerのmain()をnodeで直接叩く。
 * (workerd特有の部分 = resvg-js shim / wasm static import / setup_env は
 *  対象外。それは `wrangler dev` で確認する)
 *
 * 使い方: gleam build && node scripts/smoke.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ogRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
  console.log("png magic:", Buffer.from(buf.slice(0, 8)).toString("hex"));
} else {
  console.dir(result, { depth: 6 });
}
