export type PageLink =
  | { page: number }
  | { omitted: true };

/** 0 は省略（...）を表す */
function paginationPages(current: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current < 5) {
    return [1, 2, 3, 4, 5, 0, totalPages];
  }
  if (current > totalPages - 4) {
    return [
      1,
      0,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, 0, current - 1, current, current + 1, 0, totalPages];
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
