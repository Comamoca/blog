export type PageLink =
  | { page: number }
  | { omitted: true };

/** 0 は省略（...）を表す */
function paginationPages(current: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 2) {
    return [1, 2, 0, totalPages - 1, totalPages];
  }
  if (current >= totalPages - 1) {
    return [1, 2, 0, totalPages - 1, totalPages];
  }
  return [1, 0, current, 0, totalPages];
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
