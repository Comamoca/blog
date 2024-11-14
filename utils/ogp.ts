import { DOMParser } from "jsr:@b-fuze/deno-dom";
import * as v from "npm:valibot";

export const OGInfoSchema = v.object({
  url: v.string(),
  title: v.string(),
  image: v.union([v.string(), v.undefined()]),
  name: v.union([v.string(), v.undefined()]),
});

export type OGInfo = v.InferOutput<typeof OGInfoSchema>;

export async function fetchOGInfo(
  url: string,
  timeout = 5000,
): Promise<OGInfo> {
  const resp = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  const body = await resp.text();
  const doc = new DOMParser().parseFromString(body, "text/html");
  const og = [...doc.querySelectorAll("meta")]
    .filter((elem) => elem.hasAttribute("property"))
    .map((elem) => {
      if (elem.getAttribute("property") == "og:url") {
        return { url: elem.getAttribute("content") };
      }

      if (elem.getAttribute("property") == "og:title") {
        return { title: elem.getAttribute("content") };
      }

      if (elem.getAttribute("property") == "og:image") {
        return { image: elem.getAttribute("content") };
      }

      if (elem.getAttribute("property") == "og:site_name") {
        return { name: elem.getAttribute("content") };
      }
    })
    .reduce((acc, obj) => {
      return obj ? { ...acc, ...obj } : acc;
    }, {});

  console.log(og);

  return v.parse(OGInfoSchema, og);
}
