/**
 * `vite build` 完了後に実行するエントリポイント。
 * package.json の `build` スクリプトから呼ぶ (ssg/pagefind.ts 参照)。
 */
import { buildPagefindIndex } from "./pagefind.ts";

await buildPagefindIndex("dist");
