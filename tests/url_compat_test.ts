import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { join } from "node:path";
import { readdir, readFile, stat } from "node:fs/promises";
import { derivePublishedUrls } from "../ssg/posts.ts";

/**
 * ox-content移行のURL互換性回帰テスト (ビルド出力側)。
 *
 * tests/fixtures/urls.txt は移行時に取得した**凍結スナップショット**
 * (移行前 Lume のビルド出力 477件 + 移行直後に main へ入った新規記事4件 =
 * 481件)。このファイルはもう更新しない。新規記事を追加しても追記不要で、
 * 代わりに「ソースから導出したURL集合」を基準に出力を検証する。
 *
 * 検証は2段構え:
 *   1. スナップショットの全URLが今も出力に存在する (移行前URLを1件も失わない)
 *   2. 出力URL集合がソース導出集合と完全一致する (余剰・欠落の両方を検出)
 *
 * 2 が「ドラフト・`.nop`・`flycheck_*` の混入」と「新規記事の出力漏れ」の
 * 両方を捕まえる。ソース側だけの検証 (ビルド不要) は
 * tests/published_urls.test.ts にある。
 *
 * 出力先は BUILD_OUTPUT_DIR 環境変数で切り替える。未指定なら dist
 * (vite.config.ts の outDir と同じ)。出力ディレクトリが存在しない場合は
 * ビルド未実行とみなしてスキップする。
 */

const OUTPUT_DIR = process.env.BUILD_OUTPUT_DIR ?? "dist";
const FIXTURE_PATH = join("tests", "fixtures", "urls.txt");

/** 凍結スナップショットの件数。fixture が壊れていないことの目印。 */
const FROZEN_TOTAL = 481;
const FROZEN_BLOG = 426;

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function loadFrozenUrls(): Promise<string[]> {
  const text = await readFile(FIXTURE_PATH, "utf-8");
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * ビルド出力に含まれるページURLを列挙する。
 *
 * ページ (index.html / *.html) に加え、サイトマップとフィードも
 * 「公開URL」として数える (derivePublishedUrls 側の STATIC_URLS と対応)。
 */
async function collectOutputUrls(): Promise<string[]> {
  const urls: string[] = [];

  async function walk(dir: string, urlPrefix: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, `${urlPrefix}${entry.name}/`);
        continue;
      }
      if (entry.name === "index.html") {
        urls.push(urlPrefix);
        continue;
      }
      if (entry.name.endsWith(".html")) {
        urls.push(`${urlPrefix}${entry.name}`);
        continue;
      }
      if (urlPrefix === "/" && entry.name === "sitemap.xml") {
        urls.push("/sitemap.xml");
        continue;
      }
      if (urlPrefix === "/api/" && (entry.name === "feed.xml" || entry.name === "feed.json")) {
        urls.push(`${urlPrefix}${entry.name}`);
      }
    }
  }

  await walk(OUTPUT_DIR, "/");
  return urls.sort((a, b) => a.localeCompare(b));
}

const outputReady = await dirExists(OUTPUT_DIR);

test("URL互換性: 凍結スナップショットが壊れていない (481件・記事426件)", async () => {
  const frozen = await loadFrozenUrls();
  const blogUrls = frozen.filter((u) => u.startsWith("/blog/"));

  assert(
    frozen.length === FROZEN_TOTAL,
    `スナップショットの件数が想定外 (${frozen.length}件、${FROZEN_TOTAL}件を期待)。` +
      `tests/fixtures/urls.txt は凍結済みなので、新規記事を追記してはいけない`,
  );
  assert(
    blogUrls.length === FROZEN_BLOG,
    `スナップショットの記事URL数が想定外 (${blogUrls.length}件、${FROZEN_BLOG}件を期待)。` +
      `fixture が壊れている可能性がある`,
  );
});

test.skipIf(!outputReady)(
  "URL互換性: スナップショットの全URLに対応する出力ファイルが存在する",
  async () => {
    const output = new Set(await collectOutputUrls());
    const missing = (await loadFrozenUrls()).filter((url) => !output.has(url));

    assertEquals(
      missing,
      [],
      `${missing.length}件の移行前URLが出力から消えている (先頭10件: ${missing
        .slice(0, 10)
        .join(", ")})`,
    );
  },
);

test.skipIf(!outputReady)("URL互換性: 出力URL集合がソース導出の公開URL集合と一致する", async () => {
  const output = await collectOutputUrls();
  const derived = await derivePublishedUrls();

  const outputSet = new Set(output);
  const derivedSet = new Set(derived);

  const extra = output.filter((url) => !derivedSet.has(url));
  const missing = derived.filter((url) => !outputSet.has(url));

  assertEquals(
    extra,
    [],
    `${extra.length}件の余剰URL。下書き・.nop・flycheck_* の混入か、` +
      `host.ts のルート追加漏れの疑い (先頭10件: ${extra.slice(0, 10).join(", ")})`,
  );
  assertEquals(
    missing,
    [],
    `${missing.length}件の公開URLが出力に無い (先頭10件: ${missing.slice(0, 10).join(", ")})`,
  );
});
