import { basename } from "jsr:@std/path";
import { SITE_TITLE } from "./consts.ts";
import PostList from "./_components/PostList.tsx";
import Logo from "./_components/Logo.tsx";
import Twemoji from "./_components/Twemoji.tsx";

export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: SITE_TITLE,
  description: "全ての投稿はこちらから",
};

export default async function* (
  { search, paginate, comp }: Lume.Data,
  helpers: Lume.Helpers,
) {
  const pages = search.pages("posts")
    .filter((page) => basename(page.url).indexOf("-diary") == -1)
    .sort((a, b) => {
      // Sort articles by `pubDate`

      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);

      return (dateA - dateB) * -1;
    });

  const options = {
    url: (n: number) => `/all/${n}/`,
    size: 10,
  };

  for (const page of paginate(pages, options)) {
    yield {
      title: "全てのページ",
      url: page.url,
      content: (
        <div className="mx-8 text-lg md:mx-auto">
          <div className="my-10 flex justify-center">
            <comp.Logo />
          </div>
          <div className="flex md:items-center flex-col gap-6 grid-cols-4">
            <comp.PostList pages={page.results} />
            <div className="inline-flex flex-row justify-center py-1">
              {page.pagination.previous
                ? (
                  <a
                    href={page.pagination.previous}
                    className="btn text-xl px-4"
                  >
                    {page.pagination.page - 1}
                  </a>
                )
                : (
                  <span className="pt-1 text-xl">
                    <comp.Twemoji emoji="🦊" size={10} />
                  </span>
                )}

              <span className="my-auto mx-2">/</span>

              {page.pagination.next
                ? (
                  <a
                    href={page.pagination.next}
                    className="btn text-xl px-4"
                  >
                    {page.pagination.page + 1}
                  </a>
                )
                : (
                  <span className="pt-1 text-xl">
                    <comp.Twemoji emoji="🦊" size={10} />
                  </span>
                )}
            </div>
          </div>
        </div>
      ),
    };
  }
}
