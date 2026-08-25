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
            <nav
              aria-label="ページ送り"
              className="grid w-full max-w-md md:max-w-3xl md:px-4 grid-flow-col auto-cols-fr gap-1 sm:gap-2"
            >
              <a
                href={page.pagination.previous ?? undefined}
                className="btn btn-sm px-1.5 md:btn-lg md:px-4"
              >
                {"前へ"}
              </a>
              {pageLinks.map((p: any, i: number) => (
                <a
                  key={i}
                  href={p.url}
                  className="btn btn-sm px-1.5 md:btn-lg md:px-4"
                >
                  {p.omitted ? "…" : p.pagination.page}
                </a>
              ))}
              <a
                href={page.pagination.next ?? undefined}
                className="btn btn-sm px-1.5 md:btn-lg md:px-4"
              >
                {"後へ"}
              </a>
            </nav>
          </div>
        </div>
      ),
    };
  }
}
