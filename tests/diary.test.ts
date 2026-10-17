import { parse } from "date-fns";
import { expandGlob } from "jsr:@std/fs";
import { assert, assertEquals } from "jsr:@std/assert";
import { extractOrgMeta } from "../ssg/org-meta.ts";

function parseFileNameDate(fileName: string): Date {
  const parsed = parse(fileName.slice(0, 10), "yyyy-MM-dd", new Date());
  assert(parsed, `invalid filename date: ${fileName}`);
  return parsed;
}

function assertDateMatches(
  fileName: string,
  pubDate: string,
  message: string,
): void {
  const parsedPubDate = parse(pubDate, "MMM d yyyy", new Date());
  assert(parsedPubDate, `invalid pubDate "${pubDate}" at ${fileName}`);
  assertEquals(parseFileNameDate(fileName), parsedPubDate, message);
}

Deno.test("Blog post date validation (org)", async () => {
  const postFiles = await Array.fromAsync(expandGlob("./src/blog/*.org"));

  for (const file of postFiles) {
    if (file.name.startsWith("flycheck_")) continue;

    const content = await Deno.readTextFile(file.path);
    const meta = extractOrgMeta(content, file.name.replace(/\.org$/, ""));

    assertDateMatches(
      file.name,
      meta.pubDate,
      `slug date and #+DATE does not match. Please check keyword and slug at ${file.path}`,
    );
  }
});
