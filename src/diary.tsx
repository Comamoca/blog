import { basename } from "jsr:@std/path";
import PostList from "./_components/PostList.tsx";
import Logo from "./_components/Logo.tsx";
import { SITE_DESCRIPTION } from "./consts.ts";
import Twemoji from "./_components/Twemoji.tsx";

export const title = "すべての日報";
export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: "=title",
  description: SITE_DESCRIPTION,
};

export default function* (
  { search, paginate }: Lume.Data,
  helpers: Lume.Helpers,
) {
  const pages = search.pages("posts")
    .filter((page) => basename(page.url).indexOf("-diary") != -1)
    .sort((a, b) => {
      // Sort articles by `pubDate`

      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);

      return (dateA - dateB) * -1;
    });

  const options = {
    url: (n: number) => `/diary/${n}/`,
    size: 10,
  };

  for (const page of paginate(pages, options)) {
    yield {
      title: "",
      url: page.url,
      content: (
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
            <PostList pages={page.results} isDiary={true} />
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
                    <Twemoji emoji="🦊" size={10} />
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
                    <Twemoji emoji="🦊" size={10} />
                  </span>
                )}
            </div>
          </div>
        </>
      ),
    };
  }
}
