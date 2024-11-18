import { DOMParser } from "jsr:@b-fuze/deno-dom";
import * as v from "npm:valibot";
import { is } from "jsr:@core/unknownutil";
import { green, red } from "jsr:@std/fmt/colors";
import { basename, join } from "jsr:@std/path";
import { logger } from "../utils/logger.ts";

export const OGInfoSchema = v.object({
  url: v.union([v.string(), v.undefined()]),
  siteTitle: v.string(),
  title: v.union([v.string(), v.undefined()]),
  image: v.union([v.string(), v.undefined()]),
  name: v.union([v.string(), v.undefined()]),
});

export type OGInfo = v.InferOutput<typeof OGInfoSchema>;

export async function fetchOGInfo(
  url: string,
  timeout = 10000,
): Promise<OGInfo> {
  const useCahce = !is.Undefined(Deno.env.get("NO_CACHE"));

  const cache = await caches.open("fetchOgp");
  const _url = new URL(url);

  const resp = await (async () => {
    const resp = await cache.match(url);
    const isJSR = _url.origin.indexOf("jsr.io") != -1;
    const header = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    };

    if (is.Undefined(resp) || useCahce) {
      logger.debug(`=> ${_url.origin}: Unused cache.`);

      const resp = await fetch(_url, {
        headers: isJSR
          ? {
            ...header,
            "accept":
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          }
          : header,
        signal: AbortSignal.timeout(timeout),
      });
      await cache.put(req, resp.clone());

      return resp;
    } else {
      logger.debug(`=> ${_url.origin}: Using cache.`);

      return resp;
    }
  })();

  const body = await resp.text();
  const doc = new DOMParser().parseFromString(body, "text/html");
  const title = doc.title;

  const ogInfo = [...doc.querySelectorAll("meta")]
    .filter((elem) => elem.hasAttribute("property"))
    .map((elem) => {
      if (elem.getAttribute("property") == "og:url") {
        return { url: elem.getAttribute("content") };
      }

      if (elem.getAttribute("property") == "og:title") {
        return { title: elem.getAttribute("content") };
      }

      if (elem.getAttribute("property") == "og:image") {
        const imageUrl = elem.getAttribute("content");

        if (is.String(imageUrl)) {
          // const base = basename(imageUrl);

          if (URL.canParse(imageUrl)) {
            return { image: imageUrl };
          } else {
            return { image: join(_url.origin, imageUrl) };
          }
        } else {
          return undefined;
        }
      }

      if (elem.getAttribute("property") == "og:site_name") {
        return { name: elem.getAttribute("content") };
      }
    });

  logger.debug(`[fetchOGInfo] siteTitle: ${title}`);
  ogInfo.push({ siteTitle: title });

  const og = ogInfo.reduce((acc, obj) => {
    return obj ? { ...acc, ...obj } : acc;
  }, {});

  return v.parse(OGInfoSchema, og);
}
