import { execFileSync } from "node:child_process";
import {
  AUTHOR,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "../src/consts.ts";

const LIMIT = 10;

/**
 * gitサブプロセス用の環境変数を組み立てる。
 *
 * Node の execFileSync はデフォルトで親プロセスの環境を丸ごと継承し、
 * 上書きはできても削除はできない。pre-commitフックのプロセスにはgitが
 * `GIT_DIR` を絶対パスでexportしているため、それが継承されると `cwd` に
 * 存在しないリポジトリ外ディレクトリを渡しても `git log` が成功してしまい
 * (フックを実行している本物のリポジトリを見てしまう)、テスト用の一時
 * ディレクトリでの「リポジトリ外」フォールバック検証が意味を失う。
 * `cwd` から導いた値で `GIT_DIR`/`GIT_WORK_TREE` を明示的に上書きすることで
 * `cwd` を唯一の真実にする。
 */
function gitCommandEnv(cwd: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    GIT_DIR: `${cwd}/.git`,
    GIT_WORK_TREE: cwd,
  };
}

/**
 * 現行 plugins/lume/git_date.ts と同じ規則で日付を作る。
 * 日付部分はファイル名、時刻部分はそのファイルを追加した最初のコミット。
 *
 * 現行実装は1ファイルにつき `git log` を1回spawnしていて447回で約3.8秒
 * かかっていた。ここでは1回の `git log --name-only` 走査で全件ぶんを引く。
 */
export function firstCommitTimes(
  repoRoot: string,
  relDir: string,
): Map<string, number> {
  const times = new Map<string, number>();
  let out: string;
  try {
    out = execFileSync(
      "git",
      ["log", "--diff-filter=A", "--format=%ct", "--name-only", "--", relDir],
      {
        cwd: repoRoot,
        env: gitCommandEnv(repoRoot),
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      },
    );
  } catch {
    // gitが無い/リポジトリ外など。呼び出し側はMap.get()がundefinedを返すのを
    // 前提にファイル名の日付のみへフォールバックする。
    return times;
  }
  let ts = 0;
  for (const line of out.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (/^\d+$/.test(t)) {
      ts = Number(t) * 1000;
      continue;
    }
    // 同じファイルが複数回出たら、より古い(=追加時の)コミットを優先する
    if (!times.has(t) || times.get(t)! > ts) times.set(t, ts);
  }
  return times;
}

/**
 * 現行 getLatestArticleCommitDate 相当: lastBuildDate に使う、`relDir` 配下に
 * ファイルを「追加した」最新コミットの時刻。
 *
 * リポジトリ全体の最新コミットを使わないのは、既存記事の誤字修正やCIの調整、
 * 依存の更新でも <lastBuildDate> が動いてしまい、新しい記事が無いのに
 * フィードが更新されたように見えるため。`--diff-filter=A` で新規ファイルを
 * 追加したコミットだけに絞る (リネームは `R` 扱いなので同様に無視される)。
 *
 * gitが利用できない/リポジトリ外では現在時刻にフォールバックし、
 * ビルドが失敗しないようにする (git無しのCIサンドボックス等)。
 */
export function latestArticleCommitDate(
  repoRoot: string,
  relDir = "src/blog",
): Date {
  try {
    const out = execFileSync("git", [
      "log",
      "--diff-filter=A",
      "-1",
      "--format=%ct",
      "--",
      relDir,
    ], {
      cwd: repoRoot,
      env: gitCommandEnv(repoRoot),
      encoding: "utf8",
    });
    const ts = Number.parseInt(out.trim(), 10);
    return Number.isNaN(ts) ? new Date() : new Date(ts * 1000);
  } catch {
    return new Date();
  }
}

/** 日付はファイル名、時刻は初回コミットから合成する */
export function combineDate(
  fileDate: Date,
  commitMs: number | undefined,
): Date {
  if (commitMs === undefined) return fileDate;
  const c = new Date(commitMs);
  const d = new Date(fileDate);
  d.setUTCHours(c.getUTCHours(), c.getUTCMinutes(), c.getUTCSeconds());
  return d;
}

const rfc822 = (d: Date) => d.toUTCString();
const cdata = (s: string) =>
  `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!),
  );

export type FeedItem = {
  title: string;
  url: string;
  contentHtml: string;
  published: Date;
};

export function renderRss(items: FeedItem[], lastBuild: Date): string {
  const body = items.slice(0, LIMIT).map((i) => `
    <item>
      <title>${esc(i.title)}</title>
      <link>${SITE_URL}${i.url}</link>
      <guid isPermaLink="false">${SITE_URL}${i.url}</guid>
      <author>
        <name>${esc(AUTHOR)}</name>
        <uri>${SITE_URL}/me</uri>
      </author>
      <content:encoded>
        ${cdata(i.contentHtml)}
      </content:encoded>
      <pubDate>${rfc822(i.published)}</pubDate>
    </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/" xmlns:webfeeds="http://webfeeds.org/rss/1.0" version="2.0">
  <channel>
    <title>${esc(SITE_TITLE)}</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/api/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>
    <language>ja</language>
    <generator>ox-content</generator>
    <author>
      <name>${esc(AUTHOR)}</name>
      <uri>${SITE_URL}</uri>
    </author>${body}
  </channel>
</rss>
`;
}

export function renderJsonFeed(items: FeedItem[]): string {
  return JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1",
      title: SITE_TITLE,
      home_page_url: `${SITE_URL}/`,
      feed_url: `${SITE_URL}/api/feed.json`,
      description: SITE_DESCRIPTION,
      author: { name: AUTHOR, url: `${SITE_URL}/me` },
      items: items.slice(0, LIMIT).map((i) => ({
        id: `${SITE_URL}${i.url}`,
        url: `${SITE_URL}${i.url}`,
        title: i.title,
        content_html: i.contentHtml,
        date_published: rfc822(i.published),
        author: { name: AUTHOR, url: `${SITE_URL}/me` },
      })),
    },
    null,
    2,
  );
}
