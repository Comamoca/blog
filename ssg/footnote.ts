/**
 * 現行 plugins/lume/footnote.ts と同じ置換を生成後HTMLに対して行う。
 *
 * remark-gfm 互換の脚注 markup (`#footnote-label` / `data-footnote-backref`) を
 * 対象とする後処理で、Markdown と org の両パイプラインから共用する。
 */
export function footnotePost(html: string): string {
  return html
    .replace(/(<h2[^>]*id="footnote-label"[^>]*?)\sclass="[^"]*"/g, "$1")
    .replace(/(id="footnote-label"[^>]*>)[^<]*/, "$1脚注")
    .replace(/(data-footnote-backref[^>]*>)[^<]*(<\/a>)/g, "$1↩︎$2");
}
