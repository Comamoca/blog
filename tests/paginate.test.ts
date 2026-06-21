import { assert, assertEquals } from "jsr:@std/assert";
import { buildPageLinks, type PageLink } from "../utils/paginate.ts";

function simplify(result: PageLink[]): (number | string)[] {
  return result.map((r) => "omitted" in r ? "..." : r.page);
}

Deno.test("buildPageLinks - small pages", () => {
  assertEquals(simplify(buildPageLinks(1, 5)), [1, 2, 3, 4, 5]);
  assertEquals(simplify(buildPageLinks(3, 5)), [1, 2, 3, 4, 5]);
});

Deno.test("buildPageLinks - near start", () => {
  assertEquals(simplify(buildPageLinks(1, 10)), [1, 2, 3, 4, 5, "...", 10]);
  assertEquals(simplify(buildPageLinks(2, 10)), [1, 2, 3, 4, 5, "...", 10]);
});

Deno.test("buildPageLinks - middle", () => {
  assertEquals(simplify(buildPageLinks(5, 10)), [
    1,
    "...",
    4,
    5,
    6,
    "...",
    10,
  ]);
});

Deno.test("buildPageLinks - near end", () => {
  assertEquals(simplify(buildPageLinks(9, 10)), [1, "...", 6, 7, 8, 9, 10]);
  assertEquals(simplify(buildPageLinks(10, 10)), [1, "...", 6, 7, 8, 9, 10]);
});

Deno.test("buildPageLinks - edge cases", () => {
  assertEquals(simplify(buildPageLinks(1, 1)), [1]);
  assertEquals(simplify(buildPageLinks(1, 2)), [1, 2]);
  assertEquals(simplify(buildPageLinks(2, 2)), [1, 2]);
});

Deno.test("buildPageLinks - no unnecessary omission (gap=1)", () => {
  assertEquals(simplify(buildPageLinks(3, 5)), [1, 2, 3, 4, 5]);
  assertEquals(simplify(buildPageLinks(2, 3)), [1, 2, 3]);
});

Deno.test("buildPageLinks - no duplicates", () => {
  const result = buildPageLinks(5, 10);
  const pages = result.filter((r) => "page" in r).map((r) =>
    (r as { page: number }).page
  );
  const uniquePages = [...new Set(pages)];
  assertEquals(
    pages.length,
    uniquePages.length,
    "Should not contain duplicate pages",
  );
});

Deno.test("buildPageLinks - always sorted", () => {
  const result = buildPageLinks(5, 10);
  const pages = result.filter((r) => "page" in r).map((r) =>
    (r as { page: number }).page
  );
  const sortedPages = [...pages].sort((a, b) => a - b);
  assertEquals(pages, sortedPages, "Pages should be sorted");
});

Deno.test("buildPageLinks - always contains first and last page", () => {
  for (const totalPages of [3, 5, 10, 20]) {
    for (const current of [1, Math.ceil(totalPages / 2), totalPages]) {
      const result = buildPageLinks(current, totalPages);
      const pages = result.filter((r) => "page" in r).map((r) =>
        (r as { page: number }).page
      );

      assert(
        pages.includes(1),
        `Should always include page 1 (total=${totalPages}, current=${current})`,
      );
      assert(
        pages.includes(totalPages),
        `Should always include last page ${totalPages} (current=${current})`,
      );
    }
  }
});

Deno.test("buildPageLinks - no out of range values", () => {
  const result = buildPageLinks(5, 10);
  const pages = result.filter((r) => "page" in r).map((r) =>
    (r as { page: number }).page
  );

  for (const page of pages) {
    assert(page >= 1, `Page ${page} should be >= 1`);
    assert(page <= 10, `Page ${page} should be <= 10`);
  }
});

Deno.test("buildPageLinks - omitted has gaps", () => {
  const result = buildPageLinks(5, 10);

  for (let i = 0; i < result.length; i++) {
    if ("omitted" in result[i]) {
      assert(i > 0, "Omitted should not be first");
      assert(i < result.length - 1, "Omitted should not be last");

      const prevPage = result[i - 1] as { page: number };
      const nextPage = result[i + 1] as { page: number };

      assert(
        nextPage.page - prevPage.page > 1,
        "Omitted should only appear when there's a gap > 1",
      );
    }
  }
});
