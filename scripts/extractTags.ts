import { walk } from "jsr:@std/fs";

const BLOG_DIR = "./src/blog";

/**
 * frontmatter (Markdown) から tags を抽出する。
 * 1行の JSON 配列形式 (tags: ["a", "b"]) に対応。
 */
function extractFrontmatterTags(content: string): string[] {
  if (!content.startsWith("---")) return [];
  const end = content.indexOf("\n---", 3);
  const frontmatter = end === -1 ? "" : content.slice(3, end);
  for (const line of frontmatter.split("\n")) {
    const match = line.match(/^tags:\s*(.*)$/);
    if (!match) continue;
    const raw = match[1].trim();
    if (raw === "") return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * org の `#+FILETAGS: :tag1:tag2:` からタグを抽出する。
 * 複数行の FILETAGS があれば併合する。
 */
function extractFileTags(content: string): string[] {
  const tags: string[] = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*#\+FILETAGS:\s*(.*)$/i);
    if (!match) continue;
    for (const tag of match[1].split(":")) {
      const t = tag.trim();
      if (t !== "") tags.push(t);
    }
  }
  return tags;
}

const counts = new Map<string, number>();

// 記事は org-mode (#+FILETAGS:)。旧Markdown (frontmatter tags) にも対応する。
for await (const entry of walk(BLOG_DIR, { exts: [".org", ".md"], includeDirs: false })) {
  const content = await Deno.readTextFile(entry.path);
  const tags = entry.path.endsWith(".md")
    ? extractFrontmatterTags(content)
    : extractFileTags(content);
  for (const tag of tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);

for (const tag of sorted) {
  console.log(tag);
}
