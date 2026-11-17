import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { visit, SKIP } from "unist-util-visit";
import type { Root, Element, Text } from "hast";

const BLOCK_TAGS = new Set(["div", "p", "h1", "h2", "h3", "h4", "h5", "h6"]);

function textOf(node: Element): string {
  let out = "";
  visit(node, "text", (t: Text) => {
    out += t.value;
  });
  return out.trim();
}

const DROP_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "svg",
  "button",
  "nav",
  "header",
  "footer",
  "form",
]);

function findFirst(tree: Root, tag: string): Element | undefined {
  let found: Element | undefined;
  visit(tree, "element", (node: Element) => {
    if (node.tagName === tag) {
      found = node;
      return false;
    }
  });
  return found;
}

function title(tree: Root): string | undefined {
  const t = findFirst(tree, "title");
  const text = t?.children
    .map((c) => ("value" in c ? c.value : ""))
    .join("")
    .trim();
  return text || undefined;
}

/** ナビゲーション・検索モーダルなど本文でない要素 */
function isChrome(node: Element): boolean {
  if (DROP_TAGS.has(node.tagName)) return true;
  if (node.properties?.role === "dialog") return true;
  const cls = node.properties?.className;
  const classes = Array.isArray(cls) ? cls.map(String) : [];
  return (
    classes.includes("list-none") || classes.includes("modal") || classes.includes("modal-toggle")
  );
}

/**
 * PostCard的な `<a><div>Title</div><p>Description</p></a>` 構造は、
 * ブロック要素を複数持つインラインリンクとしてrehype-remarkに渡すと、
 * 子要素ごとに同じhrefを持つリンクへ分裂してしまう (タイトルと説明が別々の
 * 箇条書きリンクとして重複表示される)。Markdown化の前に1行のリンク+説明
 * テキストへ平坦化しておく。
 */
function flattenCardLinks(root: Element): void {
  visit(root, "element", (node: Element, index, parent) => {
    if (node.tagName !== "a" || !parent || typeof index !== "number") return;
    const blockChildren = node.children.filter(
      (c): c is Element => c.type === "element" && BLOCK_TAGS.has(c.tagName),
    );
    if (blockChildren.length < 2) return;

    const texts = blockChildren.map(textOf).filter(Boolean);
    if (texts.length < 2) return;

    const [primary, ...rest] = texts;
    node.children = [{ type: "text", value: primary }];
    const description = rest.join(" ");
    if (description) {
      parent.children.splice(index + 1, 0, { type: "text", value: `: ${description}` });
    }
    return SKIP;
  });
}

/** レンダリング済みページHTMLの本文 (main) をMarkdownにする */
export async function htmlToMarkdown(html: string): Promise<string> {
  const tree = unified().use(rehypeParse).parse(html) as Root;
  const heading = title(tree);
  const root = (findFirst(tree, "main") ?? findFirst(tree, "body")) as Element;

  visit(root, (node, index, parent) => {
    const drop = node.type === "comment" || (node.type === "element" && isChrome(node as Element));
    if (drop && parent && typeof index === "number") {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
  });

  flattenCardLinks(root);

  const processor = unified()
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify, { bullet: "-", fences: true });
  const mdast = await processor.run({ type: "root", children: [root] } as Root);
  const file = processor.stringify(mdast as never);

  const body = String(file).trim();
  return heading && !/^#\s/m.test(body) ? `# ${heading}\n\n${body}\n` : `${body}\n`;
}
