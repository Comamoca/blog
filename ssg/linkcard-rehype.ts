/**
 * ssg/linkcard.ts のカード HTML 生成を HAST (rehype) プラグインから呼ぶ版。
 *
 * org の裸URLは uniorg-rehype が `<p><a href="URL">URL</a></p>` (autolink) に変換
 * するため、対象は「子が単一の `<a>` で `textContent === href`」の段落になる。
 * OGP は `cardLinkElement` / `genURL` を共有し、`.cache/fetchogp` の
 * ファイルキャッシュを再利用する。`DISABLE_LINKCARD` を尊重する。
 */
import { visit } from "unist-util-visit";
import { cardLinkElement, genURL } from "./linkcard.ts";

function textContent(node: any): string {
  if (node.type === "text") return node.value;
  if (node.type === "element" && Array.isArray(node.children)) {
    return node.children.map(textContent).join("");
  }
  return "";
}

export default function linkcardRehype() {
  return async (tree: any) => {
    const transformers: Array<() => Promise<void>> = [];

    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (index === undefined) return;
      const idx = index;
      if (node.tagName !== "p") return;
      const meaningful = node.children.filter(
        (c: any) => !(c.type === "text" && /^\s*$/.test(c.value)),
      );
      if (meaningful.length !== 1) return;
      const child = meaningful[0];
      if (child.type !== "element" || child.tagName !== "a") return;
      const href = child.properties?.href;
      if (typeof href !== "string") return;
      if (textContent(child) !== href) return;
      // 内部アンカー等を誤変換しないよう、http(s) の絶対URLのみ対象にする
      // (org の裸URLは uniorg が scheme 付きでしか autolink しない)。
      if (!/^https?:\/\//.test(href)) return;

      transformers.push(async () => {
        try {
          const cardHTML = await cardLinkElement(genURL(href));
          parent.children[idx] = { type: "raw", value: cardHTML };
        } catch (error) {
          console.error(
            `[LinkCard] Failed to generate card for URL: ${href}, error: ${
              (error as Error).message
            }`,
          );
        }
      });
    });

    await Promise.all(transformers.map((t) => t()));
    return tree;
  };
}
