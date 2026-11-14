/** ページの絶対URLから、ssg/run-markdown.ts が書き出すMarkdown版のURLを導く */
export function markdownUrlFor(pageUrl: string): string {
  if (pageUrl.endsWith("/")) return `${pageUrl}index.md`;
  if (pageUrl.endsWith(".html")) return `${pageUrl.slice(0, -".html".length)}.md`;
  return `${pageUrl}/index.md`;
}
