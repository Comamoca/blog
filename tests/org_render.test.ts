import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert";

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

/** 脚注セクションの境界条件。 */
const fnWrap = (body: string) => `#+TITLE: T\n#+DATE: [2025-10-09 Thu]\n\n${body}\n`;

Deno.test("org レンダリング: 脚注なしでは脚注セクションが出ない", async () => {
  const { html } = await renderOrg(fnWrap("本文だけ。"), "test.org");

  assert(!html.includes(`class="footnotes"`), "脚注セクションが作られないこと");
  assert(!html.includes(`id="footnote-label"`), "footnote-label が無いこと");
});

Deno.test("org レンダリング: 複数脚注でも区切りの hr は1つだけ", async () => {
  const { html } = await renderOrg(
    fnWrap("A.[fn:1] B.[fn:2] C.[fn:3]\n\n[fn:1] one\n[fn:2] two\n[fn:3] three"),
    "test.org",
  );

  assertStringIncludes(html, `<section class="footnotes"><hr><ol>`, "hr の直後に ol が続くこと");
  assertEquals(
    (html.match(/<section class="footnotes"><hr>/g) ?? []).length,
    1,
    "脚注セクションの hr が1つだけであること",
  );
  for (const n of [1, 2, 3]) {
    assertStringIncludes(html, `<li id="fn.${n}">`, `fn.${n} があること`);
  }
});

Deno.test("org レンダリング: 本文の水平線と脚注の水平線が混同されない", async () => {
  // org の水平線は5個以上のダッシュ (4個は段落になる)
  const { html } = await renderOrg(
    fnWrap("前段\n\n-----\n\n中段。[fn:1]\n\n[fn:1] note"),
    "test.org",
  );

  assertEquals(
    (html.match(/<hr>/g) ?? []).length,
    2,
    "本文の hr と脚注セクションの hr の計2個であること",
  );
  assertStringIncludes(
    html,
    `<section class="footnotes"><hr><ol>`,
    "脚注側の hr が_section 内_にあること",
  );
});

Deno.test("org レンダリング: 脚注セクション内に見出し要素が残らない", async () => {
  const { html } = await renderOrg(fnWrap("A.[fn:1]\n\n[fn:1] one"), "test.org");

  const section = html.slice(html.indexOf(`<section class="footnotes">`));
  assert(!/<h[1-6][\s>]/.test(section), "脚注セクション内に見出し要素が無いこと");
  assertStringIncludes(html, `data-footnote-backref`, "戻りリンクがあること");
  assertStringIncludes(html, `↩︎`, "戻りリンクの記号が ↩︎ になること");
});
