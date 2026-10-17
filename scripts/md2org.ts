/**
 * Markdown → org 変換器 (Phase 2a)。
 *
 * 本文は pandoc (`-f gfm -t org`) で変換し、frontmatter は自前で org
 * キーワードへマップする。pandoc の出力する `#+begin_html` は uniorg が
 * export 扱いしないため `#+begin_export html` へ正規化し、見出しに付加される
 * `:PROPERTIES:` drawer は剥がす。
 *
 * 純関数 (`frontmatterToKeywords` / `postProcessOrg`) は Deno からも
 * import 可能にするため、node 専用モジュールは CLI 部分でのみ読む。
 *
 * 使い方:
 *   bun scripts/md2org.ts <file.md>...        # 各ファイルを in-place 変換
 *   bun scripts/md2org.ts --stdout <file.md>  # 結果を stdout へ (ファイル触らない)
 *   bun scripts/md2org.ts --out-dir <dir> <file.md>...
 *
 * pandoc は PATH 上にある前提 (呼び出し側で `nix shell nixpkgs#pandoc -c ...`)。
 */

/** md frontmatter のうち変換器が消費するフィールド。 */
export interface Frontmatter {
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  emoji: string;
  draft: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * `Oct 9 2025` / `Oct 08 2023` 形式 (Lume 時代の pubDate) を
 * `[2025-10-09 Thu]` 形式へ変換する。パースできない場合は null。
 */
export function pubDateToOrgDate(pubDate: string): string | null {
  const m = /^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{4})$/.exec(pubDate.trim());
  if (!m) return null;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months.indexOf(m[1]);
  if (month < 0) return null;
  const day = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(Date.UTC(year, month, day));
  const iso = `${year}-${String(month + 1).padStart(2, "0")}-${
    String(day).padStart(2, "0")
  }`;
  return `[${iso} ${WEEKDAYS[date.getUTCDay()]}]`;
}

/**
 * ファイル名 (stem) 先頭の `YYYY-MM-DD` から `[YYYY-MM-DD Www]` を作る。
 * 見つからなければ null。
 */
export function stemToOrgDate(stem: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(stem);
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const weekday = WEEKDAYS[date.getUTCDay()];
  return `[${m[1]}-${m[2]}-${m[3]} ${weekday}]`;
}

/**
 * frontmatter → org キーワード行。
 *
 * 出力順: TITLE / DESCRIPTION / DATE / FILETAGS / EMOJI / DRAFT。
 * DESCRIPTION は空なら省略、FILETAGS は tags が空なら省略。
 * pubDate が欠落・パース不能なら stem から日付を導出する。
 */
export function frontmatterToKeywords(fm: Frontmatter, stem: string): string {
  const lines: string[] = [];
  lines.push(`#+TITLE: ${fm.title}`);
  if (fm.description !== "") {
    lines.push(`#+DESCRIPTION: ${fm.description}`);
  }
  const date = pubDateToOrgDate(fm.pubDate) ?? stemToOrgDate(stem);
  if (date) lines.push(`#+DATE: ${date}`);
  if (fm.tags.length > 0) {
    lines.push(`#+FILETAGS: :${fm.tags.join(":")}:`);
  }
  if (fm.emoji !== "") {
    lines.push(`#+EMOJI: ${fm.emoji}`);
  }
  lines.push(`#+DRAFT: ${fm.draft ? "true" : "false"}`);
  return lines.join("\n");
}

/**
 * pandoc の org 出力を後処理する。
 *
 * - `#+begin_html` / `#+end_html` → `#+begin_export html` / `#+end_export`
 *   (uniorg は `#+begin_html` を export block として扱わないため)
 * - pandoc が見出しの直後に挿入する `:PROPERTIES:` / `:CUSTOM_ID: ...` /
 *   `:END:` drawer を剥がす
 */
export function postProcessOrg(body: string): string {
  const withoutDrawers = body.replace(
    /^:PROPERTIES:\n:CUSTOM_ID: .*\n:END:\n/gm,
    "",
  );
  return withoutDrawers
    .replaceAll("#+begin_html", "#+begin_export html")
    .replaceAll("#+end_html", "#+end_export");
}

/** pandoc を呼び出して md 本文を org へ変換する。 */
async function pandocToOrg(body: string, filterPath: string): Promise<string> {
  const { spawn } = await import("node:child_process");
  const proc = spawn(
    "pandoc",
    ["-f", "gfm", "-t", "org", `--lua-filter=${filterPath}`],
    { stdio: ["pipe", "pipe", "inherit"] },
  );
  const chunks: Uint8Array[] = [];
  const out = proc.stdout;
  if (out === null) throw new Error("pandoc stdout is not readable");
  out.on("data", (chunk: Uint8Array) => chunks.push(chunk));
  const done = new Promise<void>((resolve, reject) => {
    proc.on("error", reject);
    out.on("end", resolve);
  });
  const stdin = proc.stdin;
  if (stdin === null) throw new Error("pandoc stdin is not writable");
  stdin.end(body);
  await done;
  const code = await new Promise<number>((resolve) =>
    proc.on("close", resolve)
  );
  if (code !== 0) {
    throw new Error(`pandoc exited with code ${code}`);
  }
  let total = 0;
  for (const chunk of chunks) total += chunk.byteLength;
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

/** CLI の引数を解釈する。 */
interface CliOptions {
  mode: "in-place" | "stdout" | "out-dir";
  outDir: string;
  files: string[];
}

function parseArgs(args: string[]): CliOptions {
  const files: string[] = [];
  let mode: CliOptions["mode"] = "in-place";
  let outDir = "";
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--stdout") {
      mode = "stdout";
    } else if (arg === "--out-dir") {
      mode = "out-dir";
      i++;
      if (i >= args.length) throw new Error("--out-dir requires a directory");
      outDir = args[i];
    } else {
      files.push(arg);
    }
  }
  if (files.length === 0) {
    throw new Error(
      "usage: bun scripts/md2org.ts [--stdout <file.md> | --out-dir <dir>] <file.md>...",
    );
  }
  if (mode === "stdout" && files.length !== 1) {
    throw new Error("--stdout accepts exactly one file");
  }
  return { mode, outDir, files };
}

async function main(argv: string[]): Promise<void> {
  const { mode, outDir, files } = parseArgs(argv);
  const filterPath = new URL("./md2org-zwsp.lua", import.meta.url).pathname;
  // node 専用 (NAPI) なので CLI 実行時にのみ読み込む (Deno の型チェック回避)。
  const { prepareSource } = await import("@ox-content/napi");

  for (const file of files) {
    const src = await (await import("node:fs/promises")).readFile(
      file,
      "utf8",
    );
    const { content, frontmatter } = prepareSource(src);
    const fm: Frontmatter = {
      title: String(frontmatter.title ?? ""),
      description: typeof frontmatter.description === "string"
        ? frontmatter.description
        : "",
      pubDate: String(frontmatter.pubDate ?? ""),
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
      emoji: String(frontmatter.emoji ?? ""),
      draft: frontmatter.draft === true,
    };
    const stem = file.replace(/\.md$/, "").split("/").pop() ?? file;
    const body = await pandocToOrg(content, filterPath);
    const org = `${frontmatterToKeywords(fm, stem)}\n\n${postProcessOrg(body)}`;

    if (mode === "stdout") {
      console.log(org);
      continue;
    }
    if (mode === "out-dir") {
      const { mkdir, writeFile } = await import("node:fs/promises");
      await mkdir(outDir, { recursive: true });
      await writeFile(`${outDir}/${stem}.org`, org);
      continue;
    }
    // in-place: 兄弟に .org を書き、.md を消す
    const { writeFile, unlink } = await import("node:fs/promises");
    await writeFile(file.replace(/\.md$/, ".org"), org);
    await unlink(file);
  }
}

// CLI エントリガード: import された場合は何もしない (Deno のテストからも安全)。
if (import.meta.main) {
  await main(process.argv.slice(2));
}
