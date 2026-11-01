import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { extractOrgMeta } from "./org-meta.ts";

/**
 * 記事の読み込みと、ソースツリーから導出される公開URL集合。
 *
 * host.ts (ビルド) とテストの双方から使うことで、
 * 「どのURLが公開されるべきか」を 1 箇所に閉じ込めている。
 */

/** リポジトリルート。host.ts はルートに置かれているため同じ値になる。 */
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const BLOG_DIR = "src/blog";
export const PAGE_SIZE = 10;

/** 記事・ページネーションに依らず常に存在する固定ページ。 */
export const STATIC_URLS = [
  "/",
  "/me.html",
  "/info.html",
  "/hub.html",
  "/404.html",
  "/sitemap.xml",
  "/api/feed.xml",
  "/api/feed.json",
];

export type Post = {
  stem: string;
  file: string;
  relFile: string;
  url: string;
  title: string;
  description: string;
  pubDateRaw: string;
  pubDateMs: number;
  tags: string[];
  emoji: string;
  draft: boolean;
  isDiary: boolean;
};

/**
 * `src/blog/` のファイル名が公開記事のソースになり得るか。
 *
 * 記事のソースは org のみ。次のものは「置いてあるが公開しない」ファイルとして
 * 落とす (URLもPagefindの索引も作らない):
 *
 * - org 以外の拡張子 (`.md` など)。意図的に無効化した記事も `foo.md.nop` の
 *   ように org 以外へ改名されるため、この判定で一緒に落ちる
 * - `flycheck_*`: Emacs flycheck の一時ファイル (`.gitignore` 済み)。org でも
 *   公開しない
 */
export function isPostSource(name: string): boolean {
  if (!name.endsWith(".org")) return false;
  if (name.startsWith("flycheck_")) return false;
  return true;
}

/**
 * 記事一覧を組み立てる。
 *
 * `includeDrafts` が true のとき `#+DRAFT: true` の記事も含める。開発サーバー
 * (ctx.mode === "serve") では下書きも確認したいので true にする。本番ビルド
 * (ctx.mode === "build") では下書きを公開しない。
 */
export async function loadPosts(includeDrafts: boolean): Promise<Post[]> {
  const dir = path.join(REPO_ROOT, BLOG_DIR);
  const names = (await fs.readdir(dir)).filter(isPostSource);
  const posts: Post[] = [];

  for (const name of names) {
    const file = path.join(dir, name);
    const src = await fs.readFile(file, "utf8");
    const stem = name.replace(/\.org$/, "");
    const meta = extractOrgMeta(src, stem);
    if (meta.draft && !includeDrafts) continue;

    posts.push({
      stem,
      file,
      relFile: `${BLOG_DIR}/${name}`,
      url: `/blog/${stem}/`,
      title: meta.title,
      description: meta.description,
      pubDateRaw: meta.pubDate,
      pubDateMs: new Date(meta.pubDate).getTime(),
      tags: meta.tags,
      emoji: meta.emoji,
      draft: meta.draft,
      isDiary: stem.includes("-diary"),
    });
  }

  posts.sort((a, b) => b.pubDateMs - a.pubDateMs);
  return posts;
}

export function pageCount(itemCount: number): number {
  return Math.max(1, Math.ceil(itemCount / PAGE_SIZE));
}

/**
 * ソースツリーから導出される公開URLの集合。
 * ビルド出力 (dist/) に含まれるべきページ URL はこれと一致する。
 *
 * 記事を追加・削除したときはこの集合も変わる。URL互換性を保証する固定
 * スナップショット (tests/fixtures/urls.txt) は更新しなくてよい。
 */
export async function derivePublishedUrls(): Promise<string[]> {
  const posts = await loadPosts(false);
  const articles = posts.filter((p) => !p.isDiary);
  const diaries = posts.filter((p) => p.isDiary);
  const techArticles = articles.filter((p) => p.tags.includes("tech"));

  const urls: string[] = [...STATIC_URLS];
  for (const p of posts) urls.push(p.url);
  for (let i = 1; i <= pageCount(articles.length); i++) urls.push(`/all/${i}/`);
  for (let i = 1; i <= pageCount(techArticles.length); i++) urls.push(`/tech/${i}/`);
  for (let i = 1; i <= pageCount(diaries.length); i++) urls.push(`/diary/${i}/`);

  return urls.sort((a, b) => a.localeCompare(b));
}
