import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

/**
 * atproto handle 解決 (/.well-known/atproto-did) の検証。
 *
 * 仕様 (https://atproto.com/specs/handle HTTPS well-known Method):
 * - ボディはDID文字列そのもの。前後の空白があってはならない
 *   (クライアントはわずかな前後空白をstripするが、送信側は含めない)
 * - Content-Type は text/plain とする
 *
 * このサイトでは .well-known/ は src/well-known/ から配信され
 * (ssg/static-assets.ts)、本番のContent-Typeは src/public/_headers
 * (Cloudflare Pages) で宣言する。両方とも壊れないようここで固定する。
 */

/** このブログのAT Protocol DID。 */
const DID = "did:plc:6wkaj4y3kaertrvyfguzkd2w";

test("atproto: atproto-did ファイルはDIDのみを含む (前後の空白なし)", async () => {
  const body = await readFile(join("src", "well-known", "atproto-did"), "utf-8");
  assertEquals(body, DID, "ボディはDID文字列そのものである必要がある (末尾改行も不可)");
});

test("atproto: 本番用 _headers が atproto-did を text/plain と宣言している", async () => {
  const headers = await readFile(join("src", "public", "_headers"), "utf-8");
  assert(
    headers.includes("/.well-known/atproto-did"),
    "_headers に /.well-known/atproto-did のルールがない",
  );
  assert(
    /^\/\.well-known\/atproto-did\r?\n\s+Content-Type:\s*text\/plain/m.test(headers),
    "atproto-did のルールに Content-Type: text/plain がない",
  );
});
