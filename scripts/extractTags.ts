import { promises as fs } from "node:fs";
import * as path from "node:path";

const BLOG_DIR = "./src/blog";

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

async function main() {
  const counts = new Map<string, number>();
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true, recursive: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".org")) continue;
    const content = await fs.readFile(path.join(BLOG_DIR, entry.name), "utf8");
    for (const tag of extractFileTags(content)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .map(([tag]) => tag);
  for (const tag of sorted) console.log(tag);
}
main();
