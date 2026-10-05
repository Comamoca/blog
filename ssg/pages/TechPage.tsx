import Logo from "../../src/_components/Logo.tsx";
import PostList from "../../src/_components/PostList.tsx";
import type { PageLink, PostSummary } from "./types.ts";

export default function TechPage(
  { posts, pageLinks }: { posts: PostSummary[]; pageLinks: PageLink[] },
) {
  return (
    <div className="mx-8 text-lg md:mx-auto">
      <div className="my-8 flex flex-col justify-center">
        <Logo />
        <div className="text-center mt-2">全ての技術記事</div>
      </div>
      <div className="flex md:items-center flex-col gap-6 grid-cols-4">
        <PostList pages={posts} />
      </div>
      <div className="flex justify-center pt-3 md:pt-5">
        <div className="flex flex-row flex-wrap items-center justify-center gap-1 sm:gap-2">
          {pageLinks.map((p, i) => (
            <a
              key={i}
              href={"url" in p ? p.url : undefined}
              className="btn btn-xs md:btn-lg"
            >
              {"omitted" in p ? "…" : p.page}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
