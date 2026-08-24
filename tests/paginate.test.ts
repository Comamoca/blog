import { assert, assertEquals } from "jsr:@std/assert";
import { buildPageLinks, type PageLink } from "../utils/paginate.ts";

function simplify(result: PageLink[]): (number | string)[] {
  return result.map((r) => "omitted" in r ? "..." : r.page);
}

Deno.test("buildPageLinks - small pages show all", () => {
  assertEquals(simplify(buildPageLinks(1, 1)), [1]);
  assertEquals(simplify(buildPageLinks(1, 2)), [1, 2]);
  assertEquals(simplify(buildPageLinks(2, 2)), [1, 2]);
  assertEquals(simplify(buildPageLinks(1, 5)), [1, 2, 3, 4, 5]);
  assertEquals(simplify(buildPageLinks(3, 5)), [1, 2, 3, 4, 5]);
});

Deno.test("buildPageLinks - compact window: first, current, last", () => {
  assertEquals(simplify(buildPageLinks(5, 10)), [1, "...", 5, "...", 10]);
  assertEquals(simplify(buildPageLinks(6, 10)), [1, "...", 6, "...", 10]);
});

Deno.test("buildPageLinks - near start", () => {
  assertEquals(simplify(buildPageLinks(1, 10)), [1, "...", 10]);
  assertEquals(simplify(buildPageLinks(2, 10)), [1, 2, "...", 10]);
});

Deno.test("buildPageLinks - near end", () => {
  assertEquals(simplify(buildPageLinks(9, 10)), [1, "...", 9, 10]);
  assertEquals(simplify(buildPageLinks(10, 10)), [1, "...", 10]);
});

Deno.test("buildPageLinks - fits in one line on mobile (max 5 entries)", () => {
  for (let n = 6; n <= 50; n++) {
    for (const c of [1, 2, Math.ceil(n / 2), n - 1, n]) {
      const links = buildPageLinks(c, n);
      assert(
        links.length <= 5,
        `n=${n} c=${c}: ${links.length} entries, too wide for one line`,
      );
    }
  }
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
  for (let n = 6; n <= 20; n++) {
    for (const c of [1, Math.ceil(n / 2), n]) {
      const result = buildPageLinks(c, n);
      const pages = result.filter((r) => "page" in r).map((r) =>
        (r as { page: number }).page
      );
      const sortedPages = [...pages].sort((a, b) => a - b);
      assertEquals(
        pages,
        sortedPages,
        `Pages should be sorted (n=${n} c=${c})`,
      );
    }
  }
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
        `Should always include last page ${totalPages} (total=${totalPages}, current=${current})`,
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
  for (let n = 6; n <= 20; n++) {
    for (const c of [1, Math.ceil(n / 2), n]) {
      const result = buildPageLinks(c, n);

      for (let i = 0; i < result.length; i++) {
        if ("omitted" in result[i]) {
          assert(i > 0, `Omitted should not be first (n=${n} c=${c})`);
          assert(
            i < result.length - 1,
            `Omitted should not be last (n=${n} c=${c})`,
          );

          const prevPage = result[i - 1] as { page: number };
          const nextPage = result[i + 1] as { page: number };

          assert(
            nextPage.page - prevPage.page > 1,
            `Omitted should only appear when there's a gap > 1 (n=${n} c=${c})`,
          );
        }
      }
    }
  }
});
