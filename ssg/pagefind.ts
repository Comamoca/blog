/**
 * Pagefind索引の生成。
 *
 * 現行 (旧Lume) の `pagefind()` プラグインは `site.process([".html"], ...)`
 * でビルド済みの全HTMLページを走査していた。custom-hostには同等のフックが
 * 無いため、dist以下のHTMLを自前で走査する。
 *
 * Viteプラグインの `closeBundle` としては実装していない。
 * oxContentCustomHostの closeBundle より後に発火することをプラグイン配列の
 * 並び順で保証できず (実測: 先に発火してしまい ox-content が書き出す前の
 * distを見てしまった)、`package.json` の `build` スクリプトで
 * `vite build` の後続ステップとして明示的に直列実行する
 * (`npm run build` 参照)。
 *
 * ビルド時のみ実行する (devでは動かさない)。447記事ぶんのHTMLを毎回
 * クロールし直すコストは、O(1)の編集→反映を狙ったdevサーバーの設計と
 * 相反するため。詳細は .kiro/specs/ox-content-migration/design.md 参照。
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";

const INDEXING_OPTIONS = {
  rootSelector: "main",
  excludeSelectors: ["[data-pagefind-ignore]"],
};

async function listHtmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await listHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

/** 出力ファイルパス (dist相対) から、そのページのURLを導く */
function urlForOutputFile(outDir: string, file: string): string {
  const rel = path.relative(outDir, file).split(path.sep).join("/");
  if (rel.endsWith("/index.html")) {
    return `/${rel.slice(0, -"index.html".length)}`;
  }
  return `/${rel}`;
}

export async function buildPagefindIndex(outDir: string): Promise<void> {
  // oxContentCustomHostの他のプラグイン(docs/search:false)と同じく、
  // ビルド成果物に含めるため動的importする (devでは読み込まない)。
  const pagefind = await import("pagefind");

  const { index } = await pagefind.createIndex(INDEXING_OPTIONS);
  if (!index) {
    console.warn("[pagefind] index not created, skipping");
    return;
  }

  const files = await listHtmlFiles(outDir);
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const url = urlForOutputFile(outDir, file);
    const { errors } = await index.addHTMLFile({ url, content });
    if (errors.length > 0) {
      console.warn(`[pagefind] indexing errors for ${url}:`, errors);
    }
  }

  const { errors: writeErrors } = await index.writeFiles({
    outputPath: path.join(outDir, "pagefind"),
  });
  if (writeErrors.length > 0) {
    console.warn("[pagefind] write errors:", writeErrors);
  }

  console.log(`[pagefind] indexed ${files.length} pages`);
}
