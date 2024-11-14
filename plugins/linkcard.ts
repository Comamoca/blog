import { visit } from "npm:unist-util-visit";
import { fetchOGInfo, OGInfo } from "../utils/ogp.ts";
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
          const info = await fetchOGInfo(url);
          const cardHTML = cardLinkElement(info);
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

function cardLinkElement(og: OGInfo) {
  const url = new URL(og.url);
  const name = url.origin;

  return `
    <div class="flex flex-grow border(t gray-200) w-full h-20 max-w-md md:min-w-10">
      <a
        href="${og.url}"
        class="!no-underline flex w-full bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-100"
        title="Link Card"
      >
        <div class="flex flex-col basis-3/4">
          <h3 class="flex-grow text-xs px-3 pt-2 py-0 !mt-0 !mb-0 font-bold tracking-tight text-gray-900">
            ${og.title}
          </h3>
          <p class="font-xs px-3 py-2 !mb-0 text-gray-700 text-sm">
            ${name}
          </p>
        </div>
        <div>
        <img
        class="object-cover rounded-tr-lg rounded-br-lg h-full m-0"
          src="${og.image}"
        />
        </div>
      </a>
    </div>
     `;
}
