import { assertEquals } from "jsr:@std/assert";
import { extractOrgMeta } from "../ssg/org-meta.ts";

/**
 * org キーワード抽出の単体テスト (純粋関数なので Deno で検証できる)。
 *
 * org レンダリング本体 (ssg/org.ts) は Node 専用モジュール (linkedom 等) を
 * 参照するため Deno の型チェック対象にできない。レンダリングは実ビルド
 * (dist/blog/<stem>/index.html) で検証する。
 */

const ORG = `#+TITLE: Test Title
#+DESCRIPTION: Test description
#+DATE: [2025-10-09 Thu]
#+FILETAGS: :foo:bar:
#+EMOJI: 🦊
#+DRAFT: false

* Section

本文。
`;

Deno.test("extractOrgMeta: キーワードを Post 互換の形で抽出する", () => {
  const meta = extractOrgMeta(ORG, "2025-10-09-test");
  assertEquals(meta.title, "Test Title");
  assertEquals(meta.description, "Test description");
  assertEquals(meta.pubDate, "Oct 9 2025");
  assertEquals(meta.tags, ["foo", "bar"]);
  assertEquals(meta.emoji, "🦊");
  assertEquals(meta.draft, false);
});

Deno.test("extractOrgMeta: #+DATE 欠落時はファイル名先頭10文字にフォールバック", () => {
  const meta = extractOrgMeta("#+TITLE: x\n", "2024-03-15-foo");
  assertEquals(meta.pubDate, "Mar 15 2024");
  assertEquals(meta.title, "x");
  assertEquals(meta.emoji, "🦊");
  assertEquals(meta.tags, []);
  assertEquals(meta.description, "");
});

Deno.test("extractOrgMeta: title 欠落時は stem にフォールバック", () => {
  const meta = extractOrgMeta("#+EMOJI: 🐈\n", "2024-01-01-slug");
  assertEquals(meta.title, "2024-01-01-slug");
  assertEquals(meta.emoji, "🐈");
});

Deno.test("extractOrgMeta: #+DRAFT: true で draft になる", () => {
  const meta = extractOrgMeta("#+DRAFT: true\n", "2024-01-01-slug");
  assertEquals(meta.draft, true);
});

Deno.test("extractOrgMeta: 空タグ・タグ無しは空配列", () => {
  assertEquals(extractOrgMeta("#+FILETAGS:\n", "2024-01-01-x").tags, []);
  assertEquals(extractOrgMeta("#+TITLE: x\n", "2024-01-01-x").tags, []);
});

Deno.test("extractOrgMeta: 先頭以外は大文字小文字を問わず最初の出現を優先", () => {
  const meta = extractOrgMeta(
    "#+TITLE: first\n#+TITLE: second\n",
    "2024-01-01-x",
  );
  assertEquals(meta.title, "first");
});
