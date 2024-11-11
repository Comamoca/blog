import { SITE_TITLE } from "./consts.ts";
import { basename } from "jsr:@std/path";
import PostCard from "./components/PostCard.tsx";
import Logo from "./components/Logo.tsx";

export const layout = "layouts/main.tsx";

export default async function ({ search }: Lume.Data, helpers: Lume.Helpers) {
  return (
    <>
      <div className="-mt-20 mb-10">
        <Logo />
      </div>
      <div className="flex flex-col">
        {search.pages("posts")
          .filter((page) => basename(page.url).indexOf("-diary") == -1)
          .sort((a, b) => {
            // Sort articles by `pubDate`

            const dateA = new Date(a.pubDate);
            const dateB = new Date(b.pubDate);

            return (dateA - dateB) * -1;
          })
          .map((page, idx) => {
            return (
              <div className="mx-auto justify-center flex-grow w-8/12">
                <PostCard
                  key={idx}
                  title={page.title}
                  slug={page.url}
                  description={page.description}
                />
              </div>
            );
          })}
      </div>
    </>
  );
}

// <li><a href={page.url}>{page.title}</a></li>
