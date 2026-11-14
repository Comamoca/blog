import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { join } from "node:path";
import { readdir, readFile, stat } from "node:fs/promises";

/**
 * Markdown版ページ (ssg/run-markdown.ts) のビルド出力検査。
 *
 * `vp build` の後に `ssg/run-markdown.ts` を走らせた dist/ が対象。
 * 出力先は BUILD_OUTPUT_DIR (未指定なら dist)。存在しなければスキップする。
 * Accept: text/markdown の書き換え先が実在することを保証するため、
 * HTMLと.mdが1対1で揃っていることを見る。
 */

const OUTPUT_DIR = process.env.BUILD_OUTPUT_DIR ?? "dist";
const SKIP_DIRS = new Set(["pagefind", "assets", "img", "skills"]);
const SITE_ORIGIN = "https://comamoca.dev";

async function dirExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

async function listFiles(dir: string, ext: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...(await listFiles(full, ext)));
    } else if (entry.name.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

const available = await dirExists(OUTPUT_DIR);
const t = available ? test : test.skip;

t("markdown: 404 を除く全HTMLに対応する .md がある", async () => {
  const htmls = (await listFiles(OUTPUT_DIR, ".html")).filter(
    (f) => f !== join(OUTPUT_DIR, "404.html"),
  );
  assert(htmls.length > 0, "dist にHTMLが無い。先に vp build を実行すること");
  const missing: string[] = [];
  for (const html of htmls) {
    try {
      await stat(html.replace(/\.html$/, ".md"));
    } catch {
      missing.push(html);
    }
  }
  assertEquals(
    missing,
    [],
    `.md が無いページがある。vp build の後に ssg/run-markdown.ts を実行すること: ${missing.slice(0, 5).join(", ")}`,
  );
});

t("markdown: .md に対応するHTMLがあり、本文が空でない", async () => {
  const mds = await listFiles(OUTPUT_DIR, ".md");
  assert(mds.length > 0, "dist に .md が無い。ssg/run-markdown.ts を実行すること");
  const orphans: string[] = [];
  const empty: string[] = [];
  for (const md of mds) {
    try {
      await stat(md.replace(/\.md$/, ".html"));
    } catch {
      orphans.push(md);
    }
    if ((await readFile(md, "utf-8")).trim().length === 0) empty.push(md);
  }
  assertEquals(orphans, [], `対応するHTMLが無い .md: ${orphans.slice(0, 5).join(", ")}`);
  assertEquals(empty, [], `空の .md: ${empty.slice(0, 5).join(", ")}`);
});

t("markdown: <link rel=alternate type=text/markdown> の指す先が実在する", async () => {
  const htmls = await listFiles(OUTPUT_DIR, ".html");
  const linkRe = /<link[^>]*type="text\/markdown"[^>]*href="([^"]+)"/;
  const broken: string[] = [];
  let checked = 0;
  for (const html of htmls) {
    const m = linkRe.exec(await readFile(html, "utf-8"));
    if (!m) continue;
    checked++;
    assert(m[1].startsWith(`${SITE_ORIGIN}/`), `想定外のorigin: ${m[1]} (${html})`);
    try {
      await stat(join(OUTPUT_DIR, m[1].slice(SITE_ORIGIN.length)));
    } catch {
      broken.push(`${html} -> ${m[1]}`);
    }
  }
  assert(checked > 0, "alternate リンクを持つページが1件も無い");
  assertEquals(broken, [], `リンク切れ: ${broken.slice(0, 5).join(", ")}`);
});
