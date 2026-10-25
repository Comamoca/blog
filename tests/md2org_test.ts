/**
 * scripts/md2org.ts の純関数 (`frontmatterToKeywords` / `postProcessOrg`)
 * のユニットテスト。Deno で実行する (`vp run test` → `deno test --allow-all`)。
 */
import { assertEquals } from "jsr:@std/assert";

import {
  frontmatterToKeywords,
  postProcessOrg,
  pubDateToOrgDate,
  stemToOrgDate,
} from "../scripts/md2org.ts";

Deno.test("frontmatterToKeywords maps title, description, pubDate, tags, emoji, draft", () => {
  const fm = {
    title: "monadsが良かった話",
    description: "TSでRustlyな型が使えるmonadsが良かった話",
    pubDate: "Aug 24 2023",
    tags: ["tech", "tool", "monads"],
    emoji: "🦊",
    draft: false,
  };
  assertEquals(
    frontmatterToKeywords(fm, "2023-08-24-monads"),
    [
      "#+TITLE: monadsが良かった話",
      "#+DESCRIPTION: TSでRustlyな型が使えるmonadsが良かった話",
      "#+DATE: [2023-08-24 Thu]",
      "#+FILETAGS: :tech:tool:monads:",
      "#+EMOJI: 🦊",
      "#+DRAFT: false",
    ].join("\n"),
  );
});

Deno.test("frontmatterToKeywords omits empty description and empty tags", () => {
  const fm = {
    title: "2025-03-22の日報",
    description: "",
    pubDate: "Mar 22 2025",
    tags: [],
    emoji: "🦊",
    draft: false,
  };
  const out = frontmatterToKeywords(fm, "2025-03-22-diary");
  assertEquals(
    out,
    ["#+TITLE: 2025-03-22の日報", "#+DATE: [2025-03-22 Sat]", "#+EMOJI: 🦊", "#+DRAFT: false"].join(
      "\n",
    ),
  );
});

Deno.test("frontmatterToKeywords emits draft true", () => {
  const fm = {
    title: "wip",
    description: "",
    pubDate: "Jan 1 2026",
    tags: [],
    emoji: "",
    draft: true,
  };
  const out = frontmatterToKeywords(fm, "2026-01-01-wip");
  assertEquals(out, ["#+TITLE: wip", "#+DATE: [2026-01-01 Thu]", "#+DRAFT: true"].join("\n"));
});

Deno.test("frontmatterToKeywords falls back to filename date when pubDate missing", () => {
  const fm = {
    title: "t",
    description: "",
    pubDate: "",
    tags: [],
    emoji: "🦊",
    draft: false,
  };
  const out = frontmatterToKeywords(fm, "2024-09-08-diary");
  assertEquals(
    out,
    ["#+TITLE: t", "#+DATE: [2024-09-08 Sun]", "#+EMOJI: 🦊", "#+DRAFT: false"].join("\n"),
  );
});

Deno.test("pubDateToOrgDate handles quoted-style single-digit day and zero-padded day", () => {
  assertEquals(pubDateToOrgDate("Oct 9 2025"), "[2025-10-09 Thu]");
  assertEquals(pubDateToOrgDate("Apr 08 2023"), "[2023-04-08 Sat]");
});

Deno.test("pubDateToOrgDate returns null for unparseable input", () => {
  assertEquals(pubDateToOrgDate("not a date"), null);
  assertEquals(pubDateToOrgDate(""), null);
});

Deno.test("stemToOrgDate derives date from filename prefix", () => {
  assertEquals(stemToOrgDate("2024-09-08-diary"), "[2024-09-08 Sun]");
  assertEquals(stemToOrgDate("no-date-here"), null);
});

Deno.test("postProcessOrg rewrites begin_html to begin_export html", () => {
  const body = ["#+begin_html", "<blockquote>hello</blockquote>", "#+end_html", "", "本文"].join(
    "\n",
  );
  assertEquals(
    postProcessOrg(body),
    ["#+begin_export html", "<blockquote>hello</blockquote>", "#+end_export", "", "本文"].join(
      "\n",
    ),
  );
});

Deno.test("postProcessOrg strips PROPERTIES drawers pandoc inserts after headings", () => {
  const body = ["** 見出し", ":PROPERTIES:", ":CUSTOM_ID: 見出し", ":END:", "", "段落。"].join(
    "\n",
  );
  assertEquals(postProcessOrg(body), ["** 見出し", "", "段落。"].join("\n"));
});

Deno.test("postProcessOrg leaves ordinary content untouched", () => {
  const body = "** 見出し\n\n*強調*とZWSP\n\n#+begin_src ts\nconst x = 1;\n#+end_src\n";
  assertEquals(postProcessOrg(body), body);
});
