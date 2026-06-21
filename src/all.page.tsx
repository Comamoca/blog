import { basename } from "jsr:@std/path";
import { SITE_TITLE } from "./consts.ts";
import { buildPageLinks } from "../utils/paginate.ts";

export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: SITE_TITLE,
  description: "全ての記事はこちらから",
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

      return dateB.getTime() - dateA.getTime();
    });

  const options = {
    url: (n: number) => `/all/${n}/`,
    size: 10,
  };

  for (const page of paginate(pages, options)) {
    const current = page.pagination.page;
    const totalPages = page.pagination.totalPages;
    const allPages = paginate(pages, options);

    const pageLinks = buildPageLinks(current, totalPages).map((link) => {
      if ("omitted" in link) {
        return { omitted: true };
      }
      return allPages[link.page - 1];
    });

    yield {
      title: "全ての記事",
      url: page.url,
      content: (
        <div className="mx-8 text-lg md:mx-auto">
          <div className="my-8 flex flex-col justify-center">
            <comp.Logo />
            <div className="text-center mt-2">全ての記事</div>
          </div>
          <div className="flex md:items-center flex-col gap-6 grid-cols-4">
            <comp.PostList pages={page.results} />
          </div>
          <div className="flex justify-center pt-3 md:pt-5">
            <div className="mx-auto flex-row">
              <a
                href={page.pagination.previous}
                className="my-auto mx-2 btn btn-sm md:btn-lg"
              >
                {"前へ"}
              </a>
              {pageLinks.map((p: any, i: number) => (
                <a
                  key={i}
                  href={p.url}
                  className="my-auto mx-2 btn btn-sm md:btn-lg"
                >
                  {p.omitted ? "…" : p.pagination.page}
                </a>
              ))}
              <a
                href={page.pagination.next}
                className="my-auto mx-2 btn btn-sm md:btn-lg"
              >
                {"後へ"}
              </a>
            </div>
          </div>
        </div>
      ),
    };
  }
}
