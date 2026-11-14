/**
 * `vite build` 後に dist/**.html の Markdown 版を隣に書き出す。
 * Accept: text/markdown のリクエストは Cloudflare の Transform Rule
 * (scripts/cloudflare/markdown-rewrite-ruleset.json) がこの .md へ書き換える。
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { htmlToMarkdown } from "./markdown.ts";

const SKIP_DIRS = new Set(["pagefind", "assets", "img"]);

async function listHtmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...(await listHtmlFiles(full)));
    } else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
      out.push(full);
    }
  }
  return out;
}

const outDir = "dist";
let count = 0;
for (const file of await listHtmlFiles(outDir)) {
  const md = await htmlToMarkdown(await fs.readFile(file, "utf-8"));
  await fs.writeFile(file.replace(/\.html$/, ".md"), md);
  count++;
}
console.log(`[markdown] wrote ${count} markdown files`);
