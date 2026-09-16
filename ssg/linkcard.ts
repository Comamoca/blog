/**
 * 現行 plugins/linkcard.ts の移植版。remark(mdast)プラグイン本体のロジックは
 * 無変更。Deno固有だった fetchogp / logger / punycode の依存先のみ
 * Node向けに差し替えている。
 */
import { visit } from "unist-util-visit";
import { fetchOGInfo } from "./fetchogp.ts";
import { domainToASCII } from "node:url";

export default function linkcard() {
  return async (tree: any) => {
    const transformers: Array<() => Promise<void>> = [];

    visit(tree, "paragraph", (paragraphNode: any, idx: number) => {
      if (paragraphNode.children.length !== 1) {
        return;
      }
      if (paragraphNode.data !== undefined) {
        return;
      }

      visit(paragraphNode, "text", (textNode: any) => {
        const urls = textNode.value.match(
          /(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/g,
        );

        if (!urls || urls.length !== 1) {
          return;
        }

        const url = genURL(urls[0]);

        transformers.push(async () => {
          try {
            const cardHTML = await cardLinkElement(url);
            const node = { type: "html", value: cardHTML };
            tree.children.splice(idx, 1, node);
          } catch (error) {
            console.error(
              `[LinkCard] Failed to generate card for URL: ${url}, error: ${
                (error as Error).message
              }`,
            );
          }
        });
      });
    });

    try {
      await Promise.all(transformers.map((t) => t()));
    } catch (e) {
      console.error(
        `[LinkCard] Error during transformation: ${(e as Error).message}`,
      );
    }

    return tree;
  };
}

function genURL(urlStr: string): URL {
  const url = new URL(urlStr);
  url.hostname = domainToASCII(url.hostname);
  return url;
}

async function cardLinkElement(url: URL): Promise<string> {
  const og = await fetchOGInfo(url.toString());

  const name = url.origin;
  const title = og.title === undefined ? og.siteTitle : og.title;

  const image = og.image === undefined
    ? ""
    : `<img class="object-cover rounded-tr-lg rounded-br-lg h-full w-50 !m-0" src="${og.image}" alt="OGP image" />`;

  return `
  <div class="flex justify-center border-t border-gray-200 h-15 md:h-25 mx-5 md:mx-10">
      <a
        href="${url}"
        class="!no-underline flex w-full bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-100"
        title="Link Card"
      >
        <div class="flex grow flex-col">
          <span class="!text-xs md:!text-base px-3 pt-2 py-0 h-20 !mt-0 !mb-0 font-bold tracking-tight text-gray-900 overflow-hidden text-ellipsis">
            ${title}
          </span>
          <span class="font-xs px-3 pb-3 !mb-0 text-gray-700 text-sm max-w-48 md:max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
            ${name}
          </span>
        </div>
        ${image}
      </a>
    </div>
     `;
}
