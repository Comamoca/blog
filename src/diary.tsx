import { basename } from "jsr:@std/path";
import PostList from "./components/PostList.tsx";
import Logo from "./components/Logo.tsx";
import { SITE_DESCRIPTION } from "./consts.ts";

export const title = "すべての日報";
export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: "=title",
  description: SITE_DESCRIPTION,
};

export default function ({ search }: Lume.Data, helpers: Lume.Helpers) {
  const pages = search.pages("posts")
    .filter((page) => basename(page.url).indexOf("-diary") != -1)
    .sort((a, b) => {
      // Sort articles by `pubDate`

      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);

      return (dateA - dateB) * -1;
    });

  return (
    <>
      <div className="flex justify-center flex-col">
        <div className="mt-7 mx-auto">
          <Logo />
        </div>
        <h2 className="flex justify-center mt-5 mb-5 text-xl md:text-2xl">
          すべての日報
        </h2>
      </div>
      <div className="mx-8 flex md:items-center flex-col gap-6 grid-cols-4">
        <PostList pages={pages} isDiary={true} />
      </div>
    </>
  );
}
