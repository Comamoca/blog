/**
 * Cache API (caches.default) によるOG画像のワーカー内キャッシュ。
 *
 * キャッシュはCloudflare側 (cache-controlヘッダによるエッジ/ブラウザキャッシュ)
 * で行われるため、ワーカー内キャッシュはデフォルトで無効。
 * env の `OG_CACHE_API=1` を設定した場合のみ有効になる。
 * node環境 (gleam test / smoke) ではcachesが存在しないため常にno-op。
 */
import { BitArray } from "../../../prelude.mjs";
import { Some, None } from "../../../gleam_stdlib/gleam/option.mjs";

function cacheEnabled(ctx) {
  const value = ctx?.OG_CACHE_API ?? globalThis.__OG_ENV__?.OG_CACHE_API;
  if (value !== "1" && value !== "true") return false;
  return typeof caches !== "undefined" && !!caches?.default;
}

function toUint8Array(bitArray) {
  if (bitArray instanceof Uint8Array) return bitArray;
  const start = (bitArray.bitOffset ?? 0) >> 3;
  const length = bitArray.byteSize ?? bitArray.rawBuffer.length;
  return bitArray.rawBuffer.slice(start, start + length);
}

/**
 * ワーカー内キャッシュが有効かどうか。
 * @param {object} ctx - Workers env (hinotoのWorkersContext)
 * @returns {Promise<boolean>} Gleam Bool
 */
export async function cache_enabled(ctx) {
  return cacheEnabled(ctx);
}

/**
 * キャッシュからPNGを取得する。無効時は常にNone。
 * @param {object} ctx - Workers env (hinotoのWorkersContext)
 * @param {string} url
 * @returns {Promise<Option>} Gleam Option(BitArray)
 */
export async function match_cache(ctx, url) {
  if (!cacheEnabled(ctx)) return new None();
  const cached = await caches.default.match(url);
  if (!cached) return new None();
  const buffer = await cached.arrayBuffer();
  return new Some(new BitArray(new Uint8Array(buffer)));
}

/**
 * PNGをキャッシュに保存する。無効時は何もしない。
 * @param {object} ctx - Workers env (hinotoのWorkersContext)
 * @param {string} url
 * @param {BitArray} bits
 * @returns {Promise<undefined>} Gleam Nil
 */
export async function put_cache(ctx, url, bits) {
  if (!cacheEnabled(ctx)) return undefined;
  const response = new Response(toUint8Array(bits), {
    status: 200,
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
  await caches.default.put(new Request(url), response);
  return undefined;
}
