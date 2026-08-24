export type PageLink =
  | { page: number }
  | { omitted: true };

/** モバイルで一行に収めるため、現在ページと両端のみ表示する。隣接移動は前へ/後へボタンが担う */
function paginationPages(current: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  return [...new Set([1, current, totalPages])].sort((a, b) => a - b);
}

export function buildPageLinks(
  current: number,
  totalPages: number,
): PageLink[] {
  const rawPages = paginationPages(current, totalPages);

  const pageLinks: PageLink[] = [];
  let prev = 0;
  for (const p of rawPages) {
    if (p - prev > 1) {
      pageLinks.push({ omitted: true });
    }
    pageLinks.push({ page: p });
    prev = p;
  }

  return pageLinks;
}
