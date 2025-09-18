import { basename } from "jsr:@std/path";
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

export default async function (
  { search, comp }: Lume.Data,
  helpers: Lume.Helpers,
) {
  const pages = search.pages("posts")
    .filter((page) => basename(page.url).indexOf("-diary") == -1)
    .sort((a, b) => {
      // Sort articles by `pubDate`

      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);

      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="mx-8 text-lg md:mx-auto">
      <div className="my-10 flex justify-center">
        <comp.Logo />
      </div>
      <div className="flex md:items-center flex-col gap-6 grid-cols-4">
        <comp.PostList pages={pages.slice(0, 5)} />
        <comp.PostCard
          title="全ての投稿"
          description="全ての投稿はこちらから"
          slug="/all/1"
        />
      </div>
    </div>
  );
}
