import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";

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
 *
 * URL互換テスト (url_compat_test.ts) の走査は *.html と sitemap/feed のみで
 * .well-known 配下や _headers は数えない。そのため出力側は別途ここで検証
 * する (静的コピー機構が壊れてsrc側テストが緑のまま本番が404になるのを防ぐ)。
 */

/** このブログのAT Protocol DID。 */
const DID = "did:plc:6wkaj4y3kaertrvyfguzkd2w";

/**
 * ビルド出力側の検証。url_compat_test.ts と同じく BUILD_OUTPUT_DIR で出力先を
 * 切り替え、出力ディレクトリが無い (ビルド未実行) 場合はskipする。
 */
const OUTPUT_DIR = process.env.BUILD_OUTPUT_DIR ?? "dist";

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

const outputReady = await dirExists(OUTPUT_DIR);

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

test.skipIf(!outputReady)(
  "atproto: ビルド出力に /.well-known/atproto-did がDIDのみで含まれる",
  async () => {
    const body = await readFile(join(OUTPUT_DIR, ".well-known", "atproto-did"), "utf-8");
    assertEquals(
      body,
      DID,
      "出力された atproto-did がDID文字列と一致しない " +
        "(出力漏れ・末尾改行の付加・内容の化けのいずれか)",
    );
  },
);

test.skipIf(!outputReady)(
  "atproto: ビルド出力の _headers に atproto-did の text/plain 宣告がある",
  async () => {
    const headers = await readFile(join(OUTPUT_DIR, "_headers"), "utf-8");
    assert(
      /^\/\.well-known\/atproto-did\r?\n\s+Content-Type:\s*text\/plain/m.test(headers),
      "出力された _headers に atproto-did の Content-Type: text/plain がない " +
        "(静的コピーから _headers が漏れている)",
    );
  },
);
