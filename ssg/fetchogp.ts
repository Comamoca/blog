/**
 * 現行 utils/fetchogp.ts の Node移植版。
 *
 * Deno固有API (jsr:@b-fuze/deno-dom, jsr:@core/unknownutil, jsr:@std/*,
 * Deno Cache API) をNode相当に置き換えている。ロジック (取得したメタタグの
 * 優先順位・フォールバック) は変更していない。
 *
 * キャッシュは Deno Cache API の代わりにファイルベースのキャッシュを使う。
 * NO_CACHE 環境変数で無効化できる点は元実装を踏襲する。
 */
import { parseHTML } from "linkedom";
import * as v from "valibot";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export const OGInfoSchema = v.object({
  url: v.optional(v.string()),
  siteTitle: v.string(),
  title: v.optional(v.string()),
  image: v.optional(v.string()),
  name: v.optional(v.string()),
});

export type OGInfo = v.InferOutput<typeof OGInfoSchema>;

const CACHE_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".cache",
  "fetchogp",
);

function cacheKeyFor(url: string): string {
  // deno-lint-ignore no-control-regex
  return encodeURIComponent(url).replace(/[^\w.-]/g, "_");
}

async function readCache(url: string): Promise<string | undefined> {
  try {
    return await fs.readFile(path.join(CACHE_DIR, cacheKeyFor(url)), "utf8");
  } catch {
    return undefined;
  }
}

async function writeCache(url: string, body: string): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(CACHE_DIR, cacheKeyFor(url)), body, "utf8");
  } catch {
    // キャッシュ書き込み失敗はフェッチ自体の成否に影響させない
  }
}

export async function fetchOGInfo(
  url: string,
  timeout = 10000,
): Promise<OGInfo> {
  try {
    const useCache = process.env.NO_CACHE === undefined;
    const _url = new URL(url);

    const body = await (async () => {
      const cached = useCache ? await readCache(url) : undefined;
      if (cached !== undefined) {
        return cached;
      }

      const isJSR = _url.origin.includes("jsr.io");
      const header: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
      };

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

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const text = await resp.text();
      await writeCache(url, text);
      return text;
    })();

    const { document } = parseHTML(body);
    const title = document.title || _url.hostname || "Unknown Site";

    const ogInfo = [...document.querySelectorAll("meta")]
      .filter((elem) => elem.hasAttribute("property"))
      .map((elem) => {
        const property = elem.getAttribute("property");
        if (property === "og:url") {
          return { url: elem.getAttribute("content") ?? undefined };
        }
        if (property === "og:title") {
          return { title: elem.getAttribute("content") ?? undefined };
        }
        if (property === "og:image") {
          const imageUrl = elem.getAttribute("content");
          if (typeof imageUrl === "string") {
            if (URL.canParse(imageUrl)) {
              return { image: imageUrl };
            }
            return { image: new URL(imageUrl, _url.origin).toString() };
          }
          return undefined;
        }
        if (property === "og:site_name") {
          return { name: elem.getAttribute("content") ?? undefined };
        }
        return undefined;
      });

    ogInfo.push({ siteTitle: title } as never);

    const og = ogInfo.reduce(
      (acc, obj) => (obj ? { ...acc, ...obj } : acc),
      {},
    );

    const safeOg = {
      siteTitle: title,
      ...og,
    };

    return v.parse(OGInfoSchema, safeOg);
  } catch (error) {
    const _url = new URL(url);
    const fallbackData: OGInfo = {
      siteTitle: _url.hostname || "Unknown Site",
      url: url,
    };
    if (process.env.DEBUG) {
      console.error(`[fetchOGInfo] ${url}:`, (error as Error).message);
    }
    return fallbackData;
  }
}
