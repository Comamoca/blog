import { basename } from "jsr:@std/path";
import PostCard from "./_components/PostCard.tsx";
import { SITE_DESCRIPTION, SITE_TITLE } from "./consts.ts";
import PostList from "./_components/PostList.tsx";
import Logo from "./_components/Logo.tsx";

export const title = SITE_TITLE;
export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function ({ search }: Lume.Data, helpers: Lume.Helpers) {
  const pages = search.pages("posts")
    .filter((page) => basename(page.url).indexOf("-diary") == -1)
    .sort((a, b) => {
      // Sort articles by `pubDate`

      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);

      return (dateA - dateB) * -1;
    });

  return (
    <>
      <div className="mx-8 text-lg md:mx-auto h-screen">
        <div className="my-10 flex justify-center">
          <Logo />
        </div>
        <div className="flex md:items-center flex-col gap-6 grid-cols-4">
          <PostList pages={pages.slice(0, 3)} />
          <PostCard
            title="全ての投稿"
            description="全ての投稿はこちらから"
            slug="/all/1"
          />
        </div>
      </div>
    </>
  );
}
