import { visit } from "npm:unist-util-visit";
import { fetchOGInfo, OGInfo } from "../utils/fetchogp.ts";
import { toASCII } from "node:punycode";
import { is } from "jsr:@core/unknownutil";
import { logger } from "../utils/logger.ts";

export default function linkcard(options) {
  return async (tree) => {
    const transformers: Array<Record<string, unknown>> = [];

    visit(tree, "paragraph", (paragraphNode, idx) => {
      if (paragraphNode.children.length !== 1) {
        return tree;
      }

      if (paragraphNode && paragraphNode.data !== undefined) {
        return tree;
      }

      visit(paragraphNode, "text", (textNode) => {
        const urls = textNode.value.match(
          /(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/g,
        );

        if (!urls || urls.length !== 1) {
          return;
        }

        const url = genURL(urls[0]);

        transformers.push(async () => {
          const cardHTML = await cardLinkElement(url);
          const node = {
            type: "html",
            value: cardHTML,
          };

          tree.children.splice(idx, 1, node);
        });
      });
    });

    try {
      await Promise.all(transformers.map((t) => t()));
    } catch (e) {
      console.log("[ LinkCard ] Got Error", e);
    }

    return tree;
  };
}

function genURL(urlStr: string) {
  const url = new URL(urlStr);
  url.hostname = toASCII(url.hostname);
  return url;
}

async function cardLinkElement(url) {
  const _url = new URL(url);
  const og = await fetchOGInfo(url);

  logger.debug(`{ url: ${url}, data: ${JSON.stringify(og)} }`);

  const name = _url.origin;
  const title = (() => {
    if (is.Undefined(og.title)) {
      return og.siteTitle;
    } else {
      return og.title;
    }
  })();

  const image = (() => {
    if (is.Undefined(og.image)) {
      return "";
    } else {
      return `<img class="object-scale-down basis-4/12 rounded-tr-lg rounded-br-lg h-full m-0 md:!mt-0" src="${og.image}" />`;
    }
  })();

  return `
    <div class="flex flex-grow border(t gray-200) w-full h-20 max-w-md md:min-w-10">
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
