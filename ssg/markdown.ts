import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { visit, SKIP } from "unist-util-visit";
import type { Root, Element } from "hast";

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

/** レンダリング済みページHTMLの本文 (main) をMarkdownにする */
export async function htmlToMarkdown(html: string): Promise<string> {
  const tree = unified().use(rehypeParse).parse(html) as Root;
  const heading = title(tree);
  const root = (findFirst(tree, "main") ?? findFirst(tree, "body")) as Element;

  visit(root, "element", (node: Element, index, parent) => {
    if (isChrome(node) && parent && typeof index === "number") {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
  });

  const processor = unified()
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify, { bullet: "-", fences: true });
  const mdast = await processor.run({ type: "root", children: [root] } as Root);
  const file = processor.stringify(mdast as never);

  const body = String(file).trim();
  return heading && !/^#\s/m.test(body) ? `# ${heading}\n\n${body}\n` : `${body}\n`;
}
