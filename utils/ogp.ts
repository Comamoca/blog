import { DOMParser } from "jsr:@b-fuze/deno-dom";
import * as v from "npm:valibot";
import { is } from "jsr:@core/unknownutil";

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
  const cache = await caches.open("fetchOgp");

  const resp = await (async () => {
    const resp = await cache.match(url);

    if (is.Undefined(resp)) {
      const req = new Request(new URL(url));
      const resp = await fetch(req, { signal: AbortSignal.timeout(timeout) });
      await cache.put(req, resp);

      return resp;
    } else {
      return resp;
    }
  })();

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

  return v.parse(OGInfoSchema, og);
}
