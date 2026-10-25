/**
 * 現行 plugins/lume/footnote.ts と同じ置換を生成後HTMLに対して行う。
 *
 * remark-gfm 互換の脚注 markup (`data-footnote-backref`) を対象とする後処理。
 *
 * 脚注セクションの見出し (`#footnote-label`) は org パイプラインの
 * `footnoteNormalize()` が `<hr>` へ置き換えるため、ここでは見出しの
 * 書き換えを行わない。
 */
export function footnotePost(html: string): string {
  return html.replace(/(data-footnote-backref[^>]*>)[^<]*(<\/a>)/g, "$1↩︎$2");
}
