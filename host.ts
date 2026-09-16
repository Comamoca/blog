/**
 * ox-content custom-host のルート定義。
 *
 * 内蔵ブログモード (`blog` オプション) は使わない。生成URLが
 * `/blog/page/{n}/`・`/blog/tags/{slug}/` に固定されており、現行の
 * `/all/{n}/`・`/tech/{n}/`・`/diary/{n}/` と互換性がないため。
 * 代わりに全ルートをここで自前定義し、URL互換性を設計上保証する。
 *
 * frontmatter は @ox-content/napi の prepareSource() で読む (全文パース不要)。
 * ox-content の srcDir スキャンには依存せず、src/blog を直接列挙する
 * (将来のorg移行時に拡張子で分岐しやすくするため。詳細はdesign.md参照)。
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareSource } from "@ox-content/napi";
import { raw, renderToString } from "@ox-content/vite-plugin";

import { renderMarkdown } from "./ssg/markdown.ts";
import { buildOgImageUrl } from "./ssg/og_metas.ts";
import {
  combineDate,
  type FeedItem,
  firstCommitTimes,
  latestCommitDate,
  renderJsonFeed,
  renderRss,
} from "./ssg/feed.ts";

import PostLayout from "./src/_includes/layouts/post.tsx";
import MainLayout from "./src/_includes/layouts/main.tsx";
import HomePage from "./ssg/pages/HomePage.tsx";
import AllPage from "./ssg/pages/AllPage.tsx";
import TechPage from "./ssg/pages/TechPage.tsx";
import DiaryPage from "./ssg/pages/DiaryPage.tsx";
import MePage from "./ssg/pages/MePage.tsx";
import InfoPage from "./ssg/pages/InfoPage.tsx";
import HubPage from "./ssg/pages/HubPage.tsx";
import NotFoundPage from "./ssg/pages/NotFoundPage.tsx";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "./src/consts.ts";
import { buildPageLinks } from "./utils/paginate.ts";
import type { PageLink, Pagination, PostSummary } from "./ssg/pages/types.ts";

const REPO_ROOT = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = "src/blog";
const PAGE_SIZE = 10;

type Post = {
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
  isDiary: boolean;
};

async function loadPosts(): Promise<Post[]> {
  const dir = path.join(REPO_ROOT, BLOG_DIR);
  const names = (await fs.readdir(dir)).filter((n) => n.endsWith(".md"));
  const posts: Post[] = [];

  for (const name of names) {
    const file = path.join(dir, name);
    const src = await fs.readFile(file, "utf8");
    const fm = (prepareSource(src).frontmatter ?? {}) as Record<
      string,
      unknown
    >;
    if (fm.draft === true) continue;

    const stem = name.replace(/\.md$/, "");
    posts.push({
      stem,
      file,
      relFile: `${BLOG_DIR}/${name}`,
      url: `/blog/${stem}/`,
      title: String(fm.title ?? stem),
      description: typeof fm.description === "string" ? fm.description : "",
      pubDateRaw: String(fm.pubDate ?? ""),
      // Lumeの各page.tsxと同じ比較 (new Date(pubDate)) でソートする。
      // 同ブラウザエンジン (V8) 上でのMMM d yyyy解析なので結果は同一になる。
      pubDateMs: new Date(String(fm.pubDate ?? stem.slice(0, 10))).getTime(),
      tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
      emoji: String(fm.emoji ?? "🦊"),
      isDiary: stem.includes("-diary"),
    });
  }

  posts.sort((a, b) => b.pubDateMs - a.pubDateMs);
  return posts;
}

function toSummary(p: Post): PostSummary {
  return { title: p.title, url: p.url, description: p.description };
}

function paginate(
  items: Post[],
  urlPrefix: string,
): Array<{ page: number; pagination: Pagination; results: Post[] }> {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const out = [];
  for (let page = 1; page <= totalPages; page++) {
    const results = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    out.push({
      page,
      results,
      pagination: {
        page,
        totalPages,
        previous: page > 1 ? `${urlPrefix}${page - 1}/` : null,
        next: page < totalPages ? `${urlPrefix}${page + 1}/` : null,
      },
    });
  }
  return out;
}

function toPageLinks(
  current: number,
  totalPages: number,
  urlPrefix: string,
): PageLink[] {
  return buildPageLinks(current, totalPages).map((l) =>
    "omitted" in l
      ? { omitted: true }
      : { page: l.page, url: `${urlPrefix}${l.page}/` }
  );
}

const DOC_PROLOGUE = "<!doctype html>";

export const host = {
  async routes(ctx: any) {
    const posts = await loadPosts();
    const articles = posts.filter((p) => !p.isDiary);
    const diaries = posts.filter((p) => p.isDiary);
    const techArticles = articles.filter((p) => p.tags.includes("tech"));

    // 全ルートで同一CSSを参照するため、リクエストのたびに再計算せず一度だけ呼ぶ
    const cssHrefs: string[] = ctx.assets
      .ssrStylesheets({ modules: ["/src/_includes/layouts/post.tsx"] })
      .stylesheets.map((s: any) => s.href)
      .filter(Boolean);
    const styles = () => cssHrefs;

    const articleRoutes = posts.map((p) => ({
      path: p.url,
      title: p.title,
      description: p.description,
      inputPath: p.file,
      dependencies: [{ path: p.relFile, kind: "file" as const }],
      render: async () => {
        const source = await fs.readFile(p.file, "utf8");
        const { html } = await renderMarkdown(source, p.file);
        const body = renderToString(
          PostLayout({
            title: p.title,
            pubDate: p.pubDateRaw,
            emoji: p.emoji,
            styles: styles(),
            description: p.description,
            ogImage: buildOgImageUrl("post", p.title, p.description),
            canonicalUrl: `${SITE_URL}${p.url}`,
            children: raw(html),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    }));

    const blogDeps = [{ path: BLOG_DIR, kind: "directory" as const }];

    const allRoutes = paginate(articles, "/all/").map((
      { page, pagination, results },
    ) => ({
      path: `/all/${page}/`,
      title: "全ての記事",
      dependencies: blogDeps,
      render: () => {
        const body = renderToString(
          MainLayout({
            title: "全ての記事",
            styles: styles(),
            children: raw(
              renderToString(
                AllPage({
                  posts: results.map(toSummary),
                  pagination,
                  pageLinks: toPageLinks(page, pagination.totalPages, "/all/"),
                }) as any,
              ),
            ),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    }));

    const techRoutes = paginate(techArticles, "/tech/").map((
      { page, pagination, results },
    ) => ({
      path: `/tech/${page}/`,
      title: "全ての技術記事",
      dependencies: blogDeps,
      render: () => {
        const body = renderToString(
          MainLayout({
            title: "全ての技術記事",
            styles: styles(),
            children: raw(
              renderToString(
                TechPage({
                  posts: results.map(toSummary),
                  pageLinks: toPageLinks(page, pagination.totalPages, "/tech/"),
                }) as any,
              ),
            ),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    }));

    const diaryRoutes = paginate(diaries, "/diary/").map((
      { page, pagination, results },
    ) => ({
      path: `/diary/${page}/`,
      title: "すべての日報",
      dependencies: blogDeps,
      render: () => {
        const body = renderToString(
          MainLayout({
            title: "すべての日報",
            styles: styles(),
            children: raw(
              renderToString(
                DiaryPage({
                  posts: results.map((p) => ({
                    ...toSummary(p),
                    isDiary: true,
                  })),
                  pagination,
                }) as any,
              ),
            ),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    }));

    const homeRoute = {
      path: "/",
      title: SITE_TITLE,
      dependencies: blogDeps,
      render: () => {
        const body = renderToString(
          MainLayout({
            title: SITE_TITLE,
            styles: styles(),
            description: SITE_DESCRIPTION,
            ogImage: buildOgImageUrl("main", SITE_TITLE, SITE_DESCRIPTION),
            canonicalUrl: `${SITE_URL}/`,
            children: raw(
              renderToString(
                HomePage({ posts: articles.map(toSummary) }) as any,
              ),
            ),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    };

    const meRoute = {
      path: "/me.html",
      title: "About Me",
      render: () => {
        const body = renderToString(
          MainLayout({
            title: "About Me",
            styles: styles(),
            description: SITE_DESCRIPTION,
            ogImage: buildOgImageUrl("main", "About Me", SITE_DESCRIPTION),
            canonicalUrl: `${SITE_URL}/me.html`,
            children: raw(renderToString(MePage({}) as any)),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    };

    const infoRoute = {
      path: "/info.html",
      title: "このブログについて",
      render: () => {
        const body = renderToString(
          PostLayout({
            title: "このブログについて",
            pubDate: "",
            emoji: "❓",
            styles: styles(),
            description: SITE_DESCRIPTION,
            ogImage: buildOgImageUrl(
              "post",
              "このブログについて",
              SITE_DESCRIPTION,
            ),
            canonicalUrl: `${SITE_URL}/info.html`,
            children: raw(renderToString(InfoPage({}) as any)),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    };

    const hubRoute = {
      path: "/hub.html",
      title: "Hub",
      render: () => {
        const body = renderToString(
          MainLayout({
            title: "Hub",
            styles: styles(),
            description: SITE_DESCRIPTION,
            ogImage: buildOgImageUrl("main", "Hub", SITE_DESCRIPTION),
            canonicalUrl: `${SITE_URL}/hub.html`,
            children: raw(renderToString(HubPage({}) as any)),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}` };
      },
    };

    // フィード: 現行 Lume と同じ内容・同じパスで出す。
    //  - query "posts" 相当 = 日報を含む全記事 (posts) から新しい順に10件
    //  - 日付は git_date と同じ規則 (ファイル名の日 + 初回コミットの時刻)
    const commitTimes = firstCommitTimes(REPO_ROOT, BLOG_DIR);
    const feedCandidates = posts.slice(0, 30).map((p) => ({
      post: p,
      published: combineDate(
        new Date(`${p.stem.slice(0, 10)}T00:00:00Z`),
        commitTimes.get(`${BLOG_DIR}/${p.stem}.md`),
      ),
    }));
    feedCandidates.sort((a, b) =>
      b.published.getTime() - a.published.getTime()
    );

    const feedItems: FeedItem[] = await Promise.all(
      feedCandidates.slice(0, 10).map(async ({ post: p, published }) => {
        const source = await fs.readFile(p.file, "utf8");
        const { html } = await renderMarkdown(source, p.file);
        return { title: p.title, url: p.url, contentHtml: html, published };
      }),
    );
    const lastBuild = latestCommitDate(REPO_ROOT);

    const feedRoutes = [
      {
        path: "/api/feed.xml",
        dependencies: blogDeps,
        render: () => ({
          contentType: "application/xml",
          body: renderRss(feedItems, lastBuild),
        }),
      },
      {
        path: "/api/feed.json",
        dependencies: blogDeps,
        render: () => ({
          contentType: "application/json",
          body: renderJsonFeed(feedItems),
        }),
      },
    ];

    // notFound() は開発サーバーの未マッチ応答にのみ使われ、静的ビルドでは
    // ファイルが出力されない。/404.html は明示的なルートとして持つ必要がある。
    const notFoundRoute = {
      path: "/404.html",
      title: "Page Not Found",
      render: () => {
        const body = renderToString(
          MainLayout({
            title: "Page Not Found",
            description: SITE_DESCRIPTION,
            children: raw(renderToString(NotFoundPage({}) as any)),
          }) as any,
        );
        return { html: `${DOC_PROLOGUE}${body}`, status: 404 };
      },
    };

    return [
      homeRoute,
      ...articleRoutes,
      ...allRoutes,
      ...techRoutes,
      ...diaryRoutes,
      meRoute,
      infoRoute,
      hubRoute,
      notFoundRoute,
      ...feedRoutes,
    ];
  },

  notFound() {
    const body = renderToString(
      MainLayout({
        title: "Page Not Found",
        description: SITE_DESCRIPTION,
        children: raw(renderToString(NotFoundPage({}) as any)),
      }) as any,
    );
    return { html: `${DOC_PROLOGUE}${body}`, status: 404 };
  },
};

export default host;
