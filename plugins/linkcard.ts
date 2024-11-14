import { visit } from "npm:unist-util-visit";
import { fetchOGInfo, OGInfo } from "../utils/fetchogp.ts";
import { toASCII } from "node:punycode";
import { is } from "jsr:@core/unknownutil";

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

  const name = _url.origin;
  const title = (() => {
    if (is.Undefined(og.title)) {
      return og.siteTitle;
    } else {
      return og.title;
    }
  })();

  const ogUrl = (() => {
    if (is.Undefined(og.url)) {
      return _url.origin;
    } else {
      return og.url;
    }
  })();

  const image = (() => {
    if (is.Undefined(og.image)) {
      return "";
    } else {
      return `<img class="object-cover rounded-tr-lg rounded-br-lg h-full m-0" src="${og.image}" />`;
    }
  })();

  return `
    <div class="flex flex-grow border(t gray-200) w-full h-20 max-w-md md:min-w-10">
      <a
        href="${ogUrl}"
        class="!no-underline flex w-full bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-100"
        title="Link Card"
      >
        <div class="flex flex-col ${og.image ? "basis-3/4" : "basis-full"}">
          <h3 class="flex-grow text-xs px-3 pt-2 py-0 !mt-0 !mb-0 font-bold tracking-tight text-gray-900">
            ${title}
          </h3>
          <p class="font-xs px-3 pb-4 md:pb-2 md:!mb-0 text-gray-700 text-sm max-w-48 md:max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
            ${name}
          </p>
        </div>
        <div>
        ${image}
        </div>
      </a>
    </div>
     `;
}
