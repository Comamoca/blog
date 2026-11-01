import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { join } from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { BLOG_DIR, REPO_ROOT, derivePublishedUrls, isPostSource, loadPosts } from "../ssg/posts.ts";
import { extractOrgMeta } from "../ssg/org-meta.ts";

/**
 * 公開URL導出の検証 (ビルド出力に依存しない)。
 *
 * URL互換性テスト (tests/url_compat_test.ts) は dist/ が無いとスキップされる。
 * ここではソースツリーだけを見て「公開されるべきURL」を検証するため、
 * ビルド前でも次のような事故を検出できる:
 *
 * - 下書き (`#+DRAFT: true`) が公開URLに混ざる
 * - `.nop` や `flycheck_*.md` が記事として扱われる
 * - 新記事を足したのにURLが導出されない (fixture 追記の代わりにこれが効く)
 */

const fixturePath = join("tests", "fixtures", "urls.txt");

/** 記事URLの stem 部分 (例: "/blog/foo/" → "foo") */
function blogStem(url: string): string {
  return url.replace(/^\/blog\//, "").replace(/\/$/, "");
}

test("isPostSource: org だけを記事ソースとして受け付ける", () => {
  assert(isPostSource("2025-01-01-hello.org"), "orgファイルは記事ソースであるべき");

  // Emacs flycheck の一時ファイル (org でも公開しない)
  assert(
    !isPostSource("flycheck_2025-01-01-hello.org"),
    "flycheck_* は公開記事として扱ってはいけない",
  );
  assert(
    !isPostSource("flycheck_2025-01-01-hello.md"),
    "flycheck_* は公開記事として扱ってはいけない (.md)",
  );

  // 意図的に無効化した記事
  assert(!isPostSource("2024-10-26-diary.md.nop"), ".nop は公開記事として扱ってはいけない");

  // org 以外の拡張子
  assert(!isPostSource("2025-01-01-hello.md"), ".md は記事ソースではない");
  assert(!isPostSource("2025-01-01-hello.org.bak"), ".org.bak は記事ソースではない");
  assert(!isPostSource("notes.txt"), ".txt は記事ソースではない");
});

test("derivePublishedUrls: 下書き・.nop・flycheck_* のURLを含まない", async () => {
  const urls = await derivePublishedUrls();

  const leaked = urls.filter((url) => {
    const stem = blogStem(url);
    return stem.startsWith("flycheck_") || stem.endsWith(".nop") || /\.(md|txt|bak)$/.test(stem);
  });
  assertEquals(leaked, [], `.nop / flycheck_* / 非org の混入: ${leaked.join(", ")}`);

  // src/blog に実在する下書きがURLに現れていないこと
  const dir = join(REPO_ROOT, BLOG_DIR);
  const names = (await readdir(dir)).filter(isPostSource);
  const draftStems: string[] = [];
  for (const name of names) {
    const src = await readFile(join(dir, name), "utf8");
    const meta = extractOrgMeta(src, name.replace(/\.org$/, ""));
    if (meta.draft) draftStems.push(name.replace(/\.org$/, ""));
  }

  assert(draftStems.length > 0, "下書きが1件も無いと、この検証は何も守っていない");
  const urlSet = new Set(urls);
  const draftLeaks = draftStems.filter((stem) => urlSet.has(`/blog/${stem}/`));
  assertEquals(draftLeaks, [], `下書きの公開URL混入: ${draftLeaks.join(", ")}`);
});

test("derivePublishedUrls: 公開対象の org すべてが記事URLを持つ", async () => {
  const urls = new Set(await derivePublishedUrls());
  const posts = await loadPosts(false);
  const expected = posts.map((p) => `/blog/${p.stem}/`);

  const missing = expected.filter((url) => !urls.has(url));
  assertEquals(missing, [], `公開記事なのにURLが無い: ${missing.slice(0, 10).join(", ")}`);
});

test("derivePublishedUrls: 固定ページとページネーションを含む", async () => {
  const urls = new Set(await derivePublishedUrls());
  const posts = await loadPosts(false);
  const articles = posts.filter((p) => !p.isDiary);
  const diaries = posts.filter((p) => p.isDiary);
  const tech = articles.filter((p) => p.tags.includes("tech"));

  for (const url of ["/", "/me.html", "/info.html", "/hub.html", "/404.html", "/sitemap.xml"]) {
    assert(urls.has(url), `固定ページ ${url} が導出URLに無い`);
  }
  assert(urls.has("/api/feed.xml"), "RSSフィードが導出URLに無い");
  assert(urls.has("/api/feed.json"), "JSONフィードが導出URLに無い");

  const missingPages: string[] = [];
  for (const [prefix, count] of [
    ["/all", articles.length],
    ["/tech", tech.length],
    ["/diary", diaries.length],
  ] as const) {
    const pages = Math.max(1, Math.ceil(count / 10));
    for (let i = 1; i <= pages; i++) {
      if (!urls.has(`${prefix}/${i}/`)) missingPages.push(`${prefix}/${i}/`);
    }
  }
  assertEquals(missingPages, [], `ページネーションURLの欠落: ${missingPages.join(", ")}`);
});

test("凍結スナップショットの全URLが今もソースから導出できる", async () => {
  const frozen = (await readFile(fixturePath, "utf8"))
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const urls = new Set(await derivePublishedUrls());

  const lost = frozen.filter((url) => !urls.has(url));
  assertEquals(
    lost,
    [],
    `${lost.length}件の移行前URLがソースから導出できなくなっている (先頭10件: ${lost
      .slice(0, 10)
      .join(", ")})。記事の削除・改名はURL互換性の破壊にあたる`,
  );
});
