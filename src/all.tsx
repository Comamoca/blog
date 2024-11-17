import { basename } from "jsr:@std/path";
import { SITE_TITLE } from "./consts.ts";
import PostList from "./components/PostList.tsx";
import Logo from "./components/Logo.tsx";

export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: SITE_TITLE,
  description: "全ての投稿はこちらから",
};

// export default function* (
//   { search, paginate }: Lume.Data,
//   helpers: Lume.Helpers,
// ) {
//   const pages = search.pages("posts")
//     .filter((page) => page.published)
//     .filter((page) => basename(page.url).indexOf("-diary") == -1)
//     .sort((a, b) => {
//       // Sort articles by `pubDate`
//
//       const dateA = new Date(a.pubDate);
//       const dateB = new Date(b.pubDate);
//
//       return (dateA - dateB) * -1;
//     });
//
//   const options = {
//     url: (n: number) => `/all/${n}/`,
//     size: 10,
//   };
//
//   for (const page of paginate(pages, options)) {
//     yield {
//       title: "全てのページ",
//       url: page.url,
//       content: (
//         <div className="mx-8 text-lg md:mx-auto">
//           <div className="my-10 flex justify-center">
//             <Logo />
//           </div>
//           <div>{page.pagination.page} / {page.pagination.totalPages}</div>
//           <div className="flex md:items-center flex-col gap-6 grid-cols-4">
//           </div>
//         </div>
//       ),
//     };
//   }
// }

export default function ({ search }: Lume.Data, helpers: Lume.Helpers) {
  const pages = search.pages("posts")
    .filter((page) => page.published)
    .filter((page) => basename(page.url).indexOf("-diary") == -1)
    .sort((a, b) => {
      // Sort articles by `pubDate`

      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);

      return (dateA - dateB) * -1;
    });

  return (
    <>
      <div className="mx-8 text-lg md:mx-auto">
        <div className="my-10 flex justify-center">
          <Logo />
        </div>
        <div className="flex md:items-center flex-col gap-6 grid-cols-4">
          <PostList pages={pages} />
          {
            /*
          <PostCard
            title="全ての投稿"
            description="全ての投稿はこちらから"
            slug="/all/1"
          />
          */
          }
        </div>
      </div>
    </>
  );
}
