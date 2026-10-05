/**
 * 現行 plugins/og_metas.ts の移植版。
 *
 * Lumeの `site.process` フック部分は除去し、純粋関数のみを持つ。ox-content
 * 側では各ページのレイアウトが直接この関数を呼んで <meta property="og:image">
 * を組み立てる。ロジック (80字切り詰め・クエリパラメータの組み方) は無変更。
 */
export const OG_ORIGIN = "https://og.comamoca.dev";

export const MAX_DESCRIPTION_LENGTH = 80;

export function truncateDescription(text: string): string {
  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH)}…`
    : text;
}

export function buildOgImageUrl(
  layout: "post" | "main",
  title: string,
  description?: string,
  origin: string = OG_ORIGIN,
): string {
  const params: string[] = [
    `l=${encodeURIComponent(layout)}`,
    `t=${encodeURIComponent(title)}`,
  ];
  if (description) {
    params.push(`d=${encodeURIComponent(truncateDescription(description))}`);
  }
  return `${origin}/og.png?${params.join("&")}`;
}
