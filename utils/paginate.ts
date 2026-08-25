export type PageLink =
  | { page: number }
  | { omitted: true };

/** 現在地を中心としたスライディングウィンドウ（両端のページは常に表示） */
function paginationPages(current: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const candidates = new Set([
    1,
    current - 1,
    current,
    current + 1,
    totalPages,
  ]);
  return [...candidates]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
}

export function buildPageLinks(
  current: number,
  totalPages: number,
): PageLink[] {
  const rawPages = paginationPages(current, totalPages);

  const pageLinks: PageLink[] = [];
  for (const p of rawPages) {
    if (p === 0) {
      pageLinks.push({ omitted: true });
    } else {
      pageLinks.push({ page: p });
    }
  }

  return pageLinks;
}
