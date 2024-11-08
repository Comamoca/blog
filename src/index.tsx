import { SITE_TITLE } from "./consts.ts";
import { basename } from "jsr:@std/path";
import PostCard from "./components/PostCard.tsx";

export const layout = "layouts/main.tsx";

export default async function ({ search }: Lume.Data, helpers: Lume.Helpers) {
  return (
    <>
      {search.pages("posts")
        .reverse()
        .filter((page) => basename(page.url).indexOf("-diary") == -1)
        .map((page, idx) => {
          return (
            <PostCard
              key={idx}
              title={page.title}
              slug={page.url}
              description={page.description}
            />
          );
        })}
    </>
  );
}

// <li><a href={page.url}>{page.title}</a></li>
