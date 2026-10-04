import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import { join } from "jsr:@std/path";

/**
 * ox-content移行のURL互換性回帰テスト。
 *
 * tests/fixtures/urls.txt は移行前 (Lume, RELEASE=1) のビルド出力から生成した
 * 正規URL一覧 (477件)。移行の全フェーズを通じて、ビルド出力に対応するURL一覧が
 * 1件でもこのスナップショットと乖離したら失敗させる。
 *
 * スナップショット取得後にmainから入った新規記事はここに追記する
 * (/blog/2026-09-22-how-to-deal-with-vibe-coding/)。移行前URLが1件も消えて
 * いないこと・ドラフトが混入していないことの検証としては変わらず機能する。
 *
 * 出力先は BUILD_OUTPUT_DIR 環境変数で切り替える。
 *   - 未指定/Lumeビルド中:  _site (デフォルト)
 *   - ox-content移行後:     dist を指定して実行する
 *
 * 出力ディレクトリが存在しない場合はビルド未実行とみなしてスキップする
 * (ox-content移行の初期フェーズではまだ dist が存在しないため)。
 */

const OUTPUT_DIR = Deno.env.get("BUILD_OUTPUT_DIR") ?? "_site";
const FIXTURE_PATH = join("tests", "fixtures", "urls.txt");

async function dirExists(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(path);
    return stat.isDirectory;
  } catch {
    return false;
  }
}

async function loadExpectedUrls(): Promise<string[]> {
  const text = await Deno.readTextFile(FIXTURE_PATH);
  return text.split("\n").map((l) => l.trim()).filter(Boolean).sort();
}

/** urls.txt の1エントリ (例: "/blog/foo/" や "/me.html") を出力ファイルパスへ変換する */
function urlToOutputPath(url: string): string {
  if (url.endsWith("/")) {
    return join(OUTPUT_DIR, url, "index.html");
  }
  return join(OUTPUT_DIR, url);
}

Deno.test({
  name: "URL互換性: スナップショットの全URLに対応する出力ファイルが存在する",
  ignore: !(await dirExists(OUTPUT_DIR)),
  fn: async () => {
    const expected = await loadExpectedUrls();
    const missing: string[] = [];

    for (const url of expected) {
      const path = urlToOutputPath(url);
      try {
        await Deno.stat(path);
      } catch {
        missing.push(url);
      }
    }

    assertEquals(
      missing,
      [],
      `${missing.length}件のURLに対応する出力が見つからない (先頭10件: ${
        missing.slice(0, 10).join(", ")
      })`,
    );
  },
});

Deno.test({
  name: "URL互換性: 出力に余剰URL (ドラフト混入等) が無い",
  ignore: !(await dirExists(OUTPUT_DIR)),
  fn: async () => {
    const expected = new Set(await loadExpectedUrls());
    const extra: string[] = [];

    async function walk(dir: string, urlPrefix: string) {
      for await (const entry of Deno.readDir(dir)) {
        const full = join(dir, entry.name);
        if (entry.isDirectory) {
          await walk(full, `${urlPrefix}${entry.name}/`);
          continue;
        }
        if (entry.name === "index.html") {
          if (!expected.has(urlPrefix)) extra.push(urlPrefix);
          continue;
        }
        if (entry.name.endsWith(".html")) {
          const url = `${urlPrefix}${entry.name}`;
          if (!expected.has(url)) extra.push(url);
          continue;
        }
        if (
          (urlPrefix === "/api/" || full.includes(`${OUTPUT_DIR}/api/`)) &&
          (entry.name === "feed.xml" || entry.name === "feed.json")
        ) {
          const url = `${urlPrefix}${entry.name}`;
          if (!expected.has(url)) extra.push(url);
        }
      }
    }

    await walk(OUTPUT_DIR, "/");

    assertEquals(
      extra,
      [],
      `${extra.length}件の余剰URL (先頭10件: ${extra.slice(0, 10).join(", ")})`,
    );
  },
});

Deno.test({
  name: "URL互換性: 公開記事URLの件数が422件",
  ignore: !(await dirExists(OUTPUT_DIR)),
  fn: async () => {
    const expected = await loadExpectedUrls();
    const blogUrls = expected.filter((u) => u.startsWith("/blog/"));
    assert(
      blogUrls.length === 422,
      `スナップショット自体が想定外 (${blogUrls.length}件、422件を期待)。fixtureが壊れている可能性がある`,
    );
  },
});
