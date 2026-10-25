import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { buildPageLinks, type PageLink } from "../utils/paginate.ts";

function simplify(result: PageLink[]): (number | string)[] {
  return result.map((r) => ("omitted" in r ? "..." : r.page));
}

test("buildPageLinks - small pages", () => {
  assertEquals(simplify(buildPageLinks(1, 5)), [1, 2, 3, 4, 5]);
  assertEquals(simplify(buildPageLinks(3, 5)), [1, 2, 3, 4, 5]);
});

test("buildPageLinks - near start", () => {
  assertEquals(simplify(buildPageLinks(1, 10)), [1, 2, 10]);
  assertEquals(simplify(buildPageLinks(2, 10)), [1, 2, 3, 10]);
});

test("buildPageLinks - middle", () => {
  assertEquals(simplify(buildPageLinks(5, 10)), [1, 4, 5, 6, 10]);
});

test("buildPageLinks - near end", () => {
  assertEquals(simplify(buildPageLinks(9, 10)), [1, 8, 9, 10]);
  assertEquals(simplify(buildPageLinks(10, 10)), [1, 9, 10]);
});

test("buildPageLinks - edge cases", () => {
  assertEquals(simplify(buildPageLinks(1, 1)), [1]);
  assertEquals(simplify(buildPageLinks(1, 2)), [1, 2]);
  assertEquals(simplify(buildPageLinks(2, 2)), [1, 2]);
});

test("buildPageLinks - no unnecessary omission (gap=1)", () => {
  assertEquals(simplify(buildPageLinks(3, 5)), [1, 2, 3, 4, 5]);
  assertEquals(simplify(buildPageLinks(2, 3)), [1, 2, 3]);
});

test("buildPageLinks - no duplicates", () => {
  const result = buildPageLinks(5, 10);
  const pages = result.filter((r) => "page" in r).map((r) => (r as { page: number }).page);
  const uniquePages = [...new Set(pages)];
  assertEquals(pages.length, uniquePages.length, "Should not contain duplicate pages");
});

test("buildPageLinks - always sorted", () => {
  const result = buildPageLinks(5, 10);
  const pages = result.filter((r) => "page" in r).map((r) => (r as { page: number }).page);
  const sortedPages = [...pages].sort((a, b) => a - b);
  assertEquals(pages, sortedPages, "Pages should be sorted");
});

test("buildPageLinks - always contains first and last page", () => {
  for (const totalPages of [3, 5, 10, 20]) {
    for (const current of [1, Math.ceil(totalPages / 2), totalPages]) {
      const result = buildPageLinks(current, totalPages);
      const pages = result.filter((r) => "page" in r).map((r) => (r as { page: number }).page);

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

test("buildPageLinks - no out of range values", () => {
  const result = buildPageLinks(5, 10);
  const pages = result.filter((r) => "page" in r).map((r) => (r as { page: number }).page);

  for (const page of pages) {
    assert(page >= 1, `Page ${page} should be >= 1`);
    assert(page <= 10, `Page ${page} should be <= 10`);
  }
});

test("buildPageLinks - window format has no omissions", () => {
  for (const current of [1, 2, 5, 9, 10]) {
    const result = buildPageLinks(current, 10);
    assert(
      result.every((r) => "page" in r),
      `Should not contain omissions (current=${current})`,
    );
  }
});
