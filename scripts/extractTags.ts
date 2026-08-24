import { walk } from "jsr:@std/fs";

const BLOG_DIR = "./src/blog";

/**
 * ファイル先頭の frontmatter ブロック (--- で囲まれた部分) を抽出する。
 */
function extractFrontmatter(content: string): string {
  if (!content.startsWith("---")) return "";
  const end = content.indexOf("\n---", 3);
  return end === -1 ? "" : content.slice(3, end);
}

/**
 * frontmatter から tags を抽出する。
 * 1行の JSON 配列形式 (tags: ["a", "b"]) に対応。
 */
function extractTags(frontmatter: string): string[] {
  for (const line of frontmatter.split("\n")) {
    const match = line.match(/^tags:\s*(.*)$/);
    if (!match) continue;
    const raw = match[1].trim();
    if (raw === "") return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((t) => typeof t === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

const counts = new Map<string, number>();

for await (
  const entry of walk(BLOG_DIR, { exts: [".md"], includeDirs: false })
) {
  const content = await Deno.readTextFile(entry.path);
  const tags = extractTags(extractFrontmatter(content));
  for (const tag of tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
}

const sorted = [...counts.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

for (const tag of sorted) {
  console.log(tag);
}
