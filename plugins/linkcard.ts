import { visit } from "npm:unist-util-visit";
import { fetchOGInfo, OGInfo } from "../utils/fetchogp.ts";
import { toASCII } from "node:punycode";
import { is } from "jsr:@core/unknownutil";
import { logger } from "../utils/logger.ts";

export default function linkcard(options?: any) {
  return async (tree: any) => {
    const transformers: Array<() => Promise<void>> = [];

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
          try {
            const cardHTML = await cardLinkElement(url);
            const node = {
              type: "html",
              value: cardHTML,
            };

            tree.children.splice(idx, 1, node);
          } catch (error) {
            logger.error(
              `[LinkCard] Failed to generate card for URL: ${url}, error: ${error.message}`,
            );
            // Keep original text node if linkcard generation fails
          }
        });
      });
    });

    try {
      await Promise.all(transformers.map((t) => t()));
    } catch (e) {
      logger.error(`[LinkCard] Error during transformation: ${e.message}`);
      console.log("[ LinkCard ] Got Error", e);
    }

    return tree;
  };
}

function genURL(urlStr: string) {
  try {
    const url = new URL(urlStr);
    url.hostname = toASCII(url.hostname);
    return url;
  } catch (error) {
    logger.error(`[LinkCard] Invalid URL: ${urlStr}, error: ${error.message}`);
    throw new Error(`Invalid URL: ${urlStr}`);
  }
}

async function cardLinkElement(url: any) {
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
      // Use direct img tag for external URLs to avoid Lume's picture plugin transformation
      // Add transform-images="" to prevent image processing by Lume plugins
      return `<img class="object-cover rounded-tr-lg rounded-br-lg h-full w-50 !m-0" src="${og.image}" alt="OGP image" transform-images="" />`;
    }
  })();

  return `
    <div class="flex justify-center border(t gray-200) h-25 mx-10">
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
