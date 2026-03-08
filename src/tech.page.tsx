import { basename } from "jsr:@std/path";
import { SITE_TITLE } from "./consts.ts";
// import PostList from "./_components/PostList.tsx";
// import Logo from "./_components/Logo.tsx";
// import Twemoji from "./_components/Twemoji.tsx";

export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: SITE_TITLE,
  description: "全ての技術記事はこちらから",
};

export default async function* (
  { search, paginate, comp }: Lume.Data,
  helpers: Lume.Helpers,
) {
  const pages = search.pages("posts tech");
  // .filter((page) => basename(page.url).indexOf("-diary") == -1)
  // .sort((a, b) => {
  //   // Sort articles by `pubDate`

  //   const dateA = new Date(a.pubDate);
  //   const dateB = new Date(b.pubDate);

  //   return dateB.getTime() - dateA.getTime();
  // });

  const options = {
    url: (n: number) => `/tech/${n}/`,
    size: 10,
  };

  for (const page of paginate(pages, options)) {
    yield {
      title: "全てのページ",
      url: page.url,
      content: (
        <div className="mx-8 text-lg md:mx-auto">
          <div className="my-10 flex flex-col items-center justify-center">
            <comp.Logo />
            <span className="text-xl mt-2">全ての記事一覧</span>
          </div>
          <div className="flex md:items-center flex-col gap-6 grid-cols-4">
            <comp.PostList pages={page.results} />
            <div className="inline-flex flex-row justify-center py-1">
              {[...paginate(pages, options)].map((p, i) => (
                <a key={i} href={p.url} className="my-auto mx-2 btn">
                  {i + 1}
                </a>
              ))}
            </div>
          </div>
        </div>
      ),
    };
  }
}
