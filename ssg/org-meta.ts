/**
 * org 記事のキーワード (#+TITLE: / #+DESCRIPTION: / #+DATE: / #+FILETAGS: /
 * #+EMOJI: / #+DRAFT:) を、全文パースせずに行ベースで抽出する軽量モジュール。
 *
 * `loadPosts()` が記事メタデータとして消費する。欠落時のフォールバック
 * (title→stem, emoji→"🦊", tags→[], draft→falsy) をここで適用し、
 * Post 型を不変に保つ。
 */

export type OrgMeta = {
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  emoji: string;
  draft: boolean;
};

const MONTH_NAMES = [
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

const KEYWORD_RE = /^#\+(\w+):\s*(.*)$/;
const DATE_RE = /(\d{4})-(\d{2})-(\d{2})/;

/** 先頭に現れる順に `#+KEYWORD: value` を小文字キーで収集する (最初の出現を優先)。 */
function parseKeywords(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of source.split("\n")) {
    const m = line.match(KEYWORD_RE);
    if (!m) continue;
    const key = m[1].toLowerCase();
    if (!(key in out)) out[key] = m[2].trim();
  }
  return out;
}

/**
 * org の日付文字列を既存 frontmatter と同じ表示形式 (`MMM d yyyy`) に正規化する。
 * `#+DATE: [2025-10-09 Thu]` → `Oct 9 2025`。欠落時はファイル名先頭10文字
 * (`YYYY-MM-DD`) にフォールバックする。
 *
 * `new Date()` のタイムゾーン解析に依存せず、月名テーブルから直接組み立てることで
 * `pubDateMs = new Date(pubDate)` (V8 の `MMM d yyyy` 解析) と表示の両方を安定させる。
 */
function normalizeDate(raw: string | undefined, stem: string): string {
  const source = raw ?? stem.slice(0, 10);
  const m = source.match(DATE_RE);
  if (!m) return "";
  const month = MONTH_NAMES[Number(m[2]) - 1];
  if (month === undefined) return "";
  return `${month} ${Number(m[3])} ${m[1]}`;
}

/** `:a:b:c:` を ["a", "b", "c"] へ。空文字・欠落は []。 */
function parseFiletags(raw: string | undefined): string[] {
  if (raw === undefined) return [];
  return raw
    .split(":")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function extractOrgMeta(source: string, stem: string): OrgMeta {
  const kw = parseKeywords(source);
  return {
    title: kw.title ?? stem,
    description: kw.description ?? "",
    pubDate: normalizeDate(kw.date, stem),
    tags: parseFiletags(kw.filetags),
    emoji: kw.emoji ?? "🦊",
    draft: kw.draft === "true",
  };
}
