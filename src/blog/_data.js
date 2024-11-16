import { format } from "jsr:@std/datetime/format";
import { join } from "jsr:@std/path/join";

export const tags = ["posts"];

export const layout = "layouts/post.tsx";
export const templateEngine = "md";
export const openGraphLayout = "layouts/postOgImage.tsx";
export const metas = {
  description: "=description",
};

// export const layout = "layouts/post.vto"
// export const templateEngine = "vto"

export function url(page) {
  const usDate = page.data.pubDate;
  const yymmdd = format(new Date(usDate), "yyyy-MM-dd");

  // console.log(`./${yymmdd}-${page.data.basename}/`)

  // return join(yymmdd, page.data.url);
  return `./${yymmdd}-${page.data.basename}/`;
}
