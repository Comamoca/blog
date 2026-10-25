import { test } from "vite-plus/test";
import { assertEquals, assert } from "./_asserts.ts";
import { parse } from "date-fns";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { extractOrgMeta } from "../ssg/org-meta.ts";

function parseFileNameDate(fileName: string): Date {
  const parsed = parse(fileName.slice(0, 10), "yyyy-MM-dd", new Date());
  assert(parsed, `invalid filename date: ${fileName}`);
  return parsed;
}

function assertDateMatches(fileName: string, pubDate: string, message: string): void {
  const parsedPubDate = parse(pubDate, "MMM d yyyy", new Date());
  assert(parsedPubDate, `invalid pubDate "${pubDate}" at ${fileName}`);
  assertEquals(parseFileNameDate(fileName), parsedPubDate, message);
}

test("Blog post date validation (org)", async () => {
  const entries = await readdir("src/blog");
  const postFiles = entries.filter((name) => name.endsWith(".org")).sort();

  for (const name of postFiles) {
    if (name.startsWith("flycheck_")) continue;

    const content = await readFile(join("src/blog", name), "utf-8");
    const meta = extractOrgMeta(content, name.replace(/\.org$/, ""));

    assertDateMatches(
      name,
      meta.pubDate,
      `slug date and #+DATE does not match. Please check keyword and slug at ${join("src/blog", name)}`,
    );
  }
});
