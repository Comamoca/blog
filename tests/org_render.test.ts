import { assert, assertStringIncludes } from "jsr:@std/assert";

// linkcard はネットワーク越しのOGP取得を伴うため、テストでは無効化して
// 裸URLが autolink のまま残ることを検証する (org.ts はモジュールロード時に
// DISABLE_LINKCARD を読むため、動的 import の前に設定する)。
Deno.env.set("DISABLE_LINKCARD", "1");

const { renderOrg } = await import("../ssg/org.ts");

// 脚注・#+begin_src・裸URL・テーブル・#+begin_export html を含む org 記事。
const FIXTURE = `#+TITLE: Test Post
#+DATE: [2025-10-09 Thu]

* Heading

Some text with a note.[fn:1]

#+begin_src ts
const x: number = 1;
#+end_src

https://example.com/

| a | b |
|---+---|
| 1 | 2 |

#+begin_export html
<div class="raw-box">raw</div>
#+end_export

[fn:1] This is the footnote body.
`;

Deno.test("org レンダリング: 脚注が remark-gfm 形状に正規化される", async () => {
  const { html } = await renderOrg(FIXTURE, "test.org");

  assertStringIncludes(
    html,
    `<a href="#fn.1" class="footref" id="fnr.1" role="doc-backlink">`,
    "本文の脚注参照が footref アンカーになること",
  );
  assertStringIncludes(
    html,
    `<section class="footnotes">`,
    "脚注セクションが section.footnotes になること",
  );
  assertStringIncludes(html, `<hr>`, "脚注セクションの見出しの代わりに水平線 (hr) が置かれること");
  assert(
    !html.includes(`id="footnote-label"`),
    "脚注セクションに footnote-label 見出しが残らないこと",
  );
  assertStringIncludes(html, `<li id="fn.1">`, '脚注定義が <li id="fn.N"> になること');
  assertStringIncludes(
    html,
    `data-footnote-backref`,
    "戻りリンクが data-footnote-backref 属性を持つこと",
  );
});

Deno.test("org レンダリング: コード・裸URL・テーブル・export html が変換される", async () => {
  const { html } = await renderOrg(FIXTURE, "test.org");

  assertStringIncludes(
    html,
    `<pre class="shiki`,
    "#+begin_src が Shiki ハイライトされた <pre> になること",
  );
  assertStringIncludes(
    html,
    `catppuccin-mocha`,
    "Shiki テーマ (catppuccin-mocha) が適用されること",
  );
  assertStringIncludes(
    html,
    `<a href="https://example.com/">https://example.com/</a>`,
    "裸URLが autolink されること (DISABLE_LINKCARD によりカード化されない)",
  );
  assertStringIncludes(
    html,
    `<table><thead><tr><th>a</th><th>b</th>`,
    "テーブルが <table> に変換されること",
  );
  assertStringIncludes(
    html,
    `<div class="raw-box">raw</div>`,
    "#+begin_export html の生HTMLが素通しされること",
  );
});
