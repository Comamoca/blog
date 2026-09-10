/**
 * ASSETS binding (Workers Static Assets) からのファイル読み込み。
 * isolate内でキャッシュする (フォントは初回リクエスト時のみfetch)。
 */
import { BitArray } from "../../../prelude.mjs";

const cache = new Map();

/**
 * @param {object} ctx - Workers env (hinotoのWorkersContext)
 * @param {string} path - "/fonts/NotoSansJP-Regular.ttf" 等
 * @returns {Promise<BitArray>}
 */
export async function fetch_asset_bytes(ctx, path) {
  if (cache.has(path)) return cache.get(path);
  const binding = ctx.ASSETS;
  if (!binding) {
    throw new Error(`ASSETS binding is missing (path: ${path})`);
  }
  const res = await binding.fetch(new URL(path, "https://assets.internal"));
  if (!res.ok) {
    throw new Error(`asset fetch failed: ${path} (${res.status})`);
  }
  const buffer = await res.arrayBuffer();
  const bytes = new BitArray(new Uint8Array(buffer));
  cache.set(path, bytes);
  return bytes;
}
