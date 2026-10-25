import { walk } from "jsr:@std/fs";

const BLOG_DIR = "./src/blog";

/**
 * org の `#+FILETAGS: :tag1:tag2:` からタグを抽出する。
 * 複数行の FILETAGS があれば併合する。
 *
 * 記事はorg-modeのみ (`.md` は存在しない。src/blog の .md は
 * gitignore された flycheck の一時ファイルなので走査対象にしない)。
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

for await (const entry of walk(BLOG_DIR, { exts: [".org"], includeDirs: false })) {
  const content = await Deno.readTextFile(entry.path);
  for (const tag of extractFileTags(content)) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
}

// 出力は件数降順。同着はタグ名昇順で並べて決定論的にする
// (walk のファイル列挙順はOS依存のため、タイ順のままでは実行環境で並びが変わる)
const sorted = [...counts.entries()]
  .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  .map(([tag]) => tag);

for (const tag of sorted) {
  console.log(tag);
}
