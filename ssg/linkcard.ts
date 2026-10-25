/**
 * linkcard の共通資産。OGP を取得してカード HTML 文字列を生成する。
 *
 * mdast 版の remark プラグインは Lume/md パイプラインの撤去時に削除した。
 * org パイプラインの ssg/linkcard-rehype.ts (HAST 版) がこの関数群を利用する。
 */
import { fetchOGInfo } from "./fetchogp.ts";
import { domainToASCII } from "node:url";

export function genURL(urlStr: string): URL {
  const url = new URL(urlStr);
  url.hostname = domainToASCII(url.hostname);
  return url;
}

export async function cardLinkElement(url: URL): Promise<string> {
  const og = await fetchOGInfo(url.toString());

  const name = url.origin;
  const title = og.title === undefined ? og.siteTitle : og.title;

  const image =
    og.image === undefined
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
