/**
 * org 記事のレンダリングパイプライン。
 *
 * unified で org → orgast (uniorg-parse) → hast (uniorg-rehype) → 生HTML
 * (rehype-raw) → コードハイライト (shiki, catppuccin-mocha) → リンクカード
 * (linkcardRehype) → 脚注正規化 (footnoteNormalize) → HTML 文字列、の順に処理し、
 * 最後に既存の footnotePost (remark-gfm 互換の脚注仕上げ) を適用する。
 * ox-content の transformMarkdown は通さない (org 専用のパイプライン)。
 */
import { unified } from "unified";
import uniorgParse from "uniorg-parse";
import uniorgRehype from "uniorg-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

import { shiki, SHIKI_OPTIONS } from "./highlight.ts";
import linkcardRehype from "./linkcard-rehype.ts";
import { footnotePost } from "./footnote.ts";

// uniorg-rehype が生成する HAST を、このモジュールが操作する範囲だけを表す
// 最小の構造型。`hast` / `@types/hast` パッケージは Deno テストから型解決でき
// ないため自前定義する (実行時の木構造は変えない)。
type HastText = { type: "text"; value: string };
type HastElement = {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
};
type HastNode = HastElement | HastText;
type HastRoot = { type: "root"; children: HastNode[] };

function isElement(node: unknown): node is HastElement {
  return typeof node === "object" && node !== null && "type" in node && node.type === "element";
}

function isRoot(node: unknown): node is HastRoot {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "root" &&
    "children" in node &&
    Array.isArray(node.children)
  );
}

function textContent(node: HastElement): string {
  return node.children
    .map((child) => {
      if (child.type === "text") return child.value;
      if (child.type === "element") return textContent(child);
      return "";
    })
    .join("");
}

function hasClassName(node: HastElement, name: string): boolean {
  const className = node.properties.className;
  if (className === undefined) return false;
  return Array.isArray(className) ? className.includes(name) : className === name;
}

/**
 * uniorg-rehype の脚注定義 `<div class="footnote-definition">` を remark-gfm 相当の
 * `<li id="fn.N">` に変換する。番号は `<ol>` の自動採番に任せるため
 * `<sup>N</sup>` を捨て、戻りリンク (`data-footnote-backref`) を末尾に付ける。
 */
function footnoteDefinitionToLi(div: HastElement): HastElement {
  let footnum: HastElement | undefined;
  let footdef: HastElement | undefined;

  for (const child of div.children) {
    if (!isElement(child)) continue;
    if (child.tagName === "sup") {
      const anchor = child.children.find(isElement);
      if (anchor !== undefined && anchor.tagName === "a") footnum = anchor;
    } else if (child.tagName === "div" && hasClassName(child, "footdef")) {
      footdef = child;
    }
  }

  const id = typeof footnum?.properties.id === "string" ? footnum.properties.id : undefined;
  const backrefHref = typeof footnum?.properties.href === "string" ? footnum.properties.href : "#";

  const backref: HastElement = {
    type: "element",
    tagName: "a",
    properties: {
      href: backrefHref,
      "data-footnote-backref": "",
      className: ["data-footnote-backref"],
      ariaLabel: "Back to reference",
    },
    children: [{ type: "text", value: "↩" }],
  };

  const properties: Record<string, unknown> = {};
  if (id !== undefined) properties.id = id;

  return {
    type: "element",
    tagName: "li",
    properties,
    children: [...(footdef?.children ?? []), backref],
  };
}

/**
 * uniorg-rehype の脚注出力 (`<h1>Footnotes:</h1>` + `<div class="footnote-definition">`)
 * を、既存 footnotePost とサイト CSS が期待する remark-gfm 形状へ正規化する。
 */
function footnoteNormalize() {
  return (tree: unknown) => {
    if (!isRoot(tree)) return;
    const children = tree.children;

    let headingIdx = -1;
    for (let i = 0; i < children.length; i++) {
      const n = children[i];
      if (isElement(n) && n.tagName === "h1" && textContent(n) === "Footnotes:") {
        headingIdx = i;
        break;
      }
    }
    if (headingIdx === -1) return;

    const liNodes: HastElement[] = [];
    let endIdx = children.length;
    for (let i = headingIdx + 1; i < children.length; i++) {
      const n = children[i];
      if (isElement(n) && n.tagName === "div" && hasClassName(n, "footnote-definition")) {
        liNodes.push(footnoteDefinitionToLi(n));
      } else {
        endIdx = i;
        break;
      }
    }

    const section: HastElement = {
      type: "element",
      tagName: "section",
      properties: { className: ["footnotes"] },
      children: [
        // 脚注セクションは見出しを持たない。区切りは水平線 (hr) で表現する。
        {
          type: "element",
          tagName: "hr",
          properties: {},
          children: [],
        },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: liNodes,
        },
      ],
    };

    children.splice(headingIdx, endIdx - headingIdx, section);
  };
}

// DISABLE_LINKCARD で linkcard プラグイン自体を外す
// (ネットワーク越しのOGP取得を伴うため)。
const DISABLE_LINKCARD = process.env.DISABLE_LINKCARD !== undefined;

export async function renderOrg(source: string, file: string): Promise<{ html: string }> {
  try {
    const processor = unified()
      .use(uniorgParse, { useSubSuperscripts: false })
      .use(uniorgRehype)
      .use(rehypeRaw)
      .use(shiki, SHIKI_OPTIONS);
    if (!DISABLE_LINKCARD) processor.use(linkcardRehype);

    const result = await processor
      .use(footnoteNormalize)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(source);

    return { html: footnotePost(String(result)) };
  } catch (error) {
    throw new Error(`Failed to render org file: ${file}: ${(error as Error).message}`);
  }
}
