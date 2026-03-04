import { basename } from "jsr:@std/path";
import PostCard from "./_components/PostCard.tsx";
import { SITE_DESCRIPTION, SITE_TITLE, TWITTER_USERNAME } from "./consts.ts";

export const title = SITE_TITLE;
export const url = "/";
export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  twitter: TWITTER_USERNAME,
};

// Tags that indicate personal/lifestyle content (non-tech)
const PERSONAL_TAGS = new Set([
  "shinycolors",
  "houkura",
  "kanda-meshi",
  "radio",
  "poem",
  "job",
  "dialy",
  "attended",
]);

function isTech(tags: string[] | undefined | null): boolean {
  if (!tags || tags.length === 0) return true;
  return !tags.every((tag) => PERSONAL_TAGS.has(tag));
}

export default async function (
  { search, comp }: Lume.Data,
  _helpers: Lume.Helpers,
) {
  const pages = search.pages("posts")
    .filter((page) => basename(page.url).indexOf("-diary") == -1)
    .sort((a, b) => {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      return dateB.getTime() - dateA.getTime();
    });

  const recentPages = pages.slice(0, 20);

  return (
    <div className="mx-8 text-lg md:mx-auto" data-pagefind-ignore>
      <div className="my-10 flex justify-center">
        <comp.Logo />
      </div>
      <div
        className="flex md:items-center flex-col gap-6 grid-cols-4"
        {...{ "x-data": "{ filter: 'all' }" }}
      >
        <div className="flex justify-center">
          <div className="join">
            <button
              className="btn btn-sm join-item"
              {...{
                "x-bind:class": "{ 'btn-active': filter === 'all' }",
                "x-on:click": "filter = 'all'",
              }}
            >
              全て
            </button>
            <button
              className="btn btn-sm join-item"
              {...{
                "x-bind:class": "{ 'btn-active': filter === 'tech' }",
                "x-on:click": "filter = 'tech'",
              }}
            >
              技術記事
            </button>
            <button
              className="btn btn-sm join-item"
              {...{
                "x-bind:class": "{ 'btn-active': filter === 'other' }",
                "x-on:click": "filter = 'other'",
              }}
            >
              その他
            </button>
          </div>
        </div>
        {recentPages.map((page, idx) => {
          const tech = isTech((page as any).tags);
          return (
            <div
              key={idx}
              className="flex flex-grow justify-center md:w-8/12 md:mx-5"
              {...{
                "x-show": tech
                  ? "filter === 'all' || filter === 'tech'"
                  : "filter === 'all' || filter === 'other'",
              }}
            >
              <PostCard
                title={page.title}
                slug={page.url}
                description={page.description}
              />
            </div>
          );
        })}
        <comp.PostCard
          title="全ての投稿"
          description="全ての投稿はこちらから"
          slug="/all/1"
        />
      </div>
    </div>
  );
}
