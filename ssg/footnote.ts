/**
 * 現行 plugins/lume/footnote.ts と同じ置換を生成後HTMLに対して行う。
 *
 * remark-gfm 互換の脚注 markup (`data-footnote-backref`) を対象とする後処理で、
 * Markdown と org の両パイプラインから共用する。
 *
 * 脚注セクションの見出し (`#footnote-label`) は org パイプライン側で `<hr>` に
 * 置き換え済みで、Markdown パイプラインも同様に水平線だけを置くため、ここでは
 * 見出しの書き換えを行わない。
 */
export function footnotePost(html: string): string {
  return html.replace(/(data-footnote-backref[^>]*>)[^<]*(<\/a>)/g, "$1↩︎$2");
}
