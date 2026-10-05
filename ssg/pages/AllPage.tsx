import Logo from "../../src/_components/Logo.tsx";
import PostList from "../../src/_components/PostList.tsx";
import type { PageLink, Pagination, PostSummary } from "./types.ts";

export default function AllPage(
  { posts, pagination, pageLinks }: {
    posts: PostSummary[];
    pagination: Pagination;
    pageLinks: PageLink[];
  },
) {
  return (
    <div className="mx-8 text-lg md:mx-auto">
      <div className="my-8 flex flex-col justify-center">
        <Logo />
        <div className="text-center mt-2">全ての記事</div>
      </div>
      <div className="flex md:items-center flex-col gap-6 grid-cols-4">
        <PostList pages={posts} />
      </div>
      <div className="flex justify-center pt-3 md:pt-5">
        <nav
          aria-label="ページ送り"
          className="grid w-full max-w-md md:max-w-3xl md:px-4 grid-flow-col auto-cols-fr gap-1 sm:gap-2"
        >
          <a
            href={pagination.previous ?? undefined}
            className="btn btn-sm px-1.5 md:btn-lg md:px-4"
          >
            {"前へ"}
          </a>
          {pageLinks.map((p, i) => (
            <a
              key={i}
              href={"url" in p ? p.url : undefined}
              className="btn btn-sm px-1.5 md:btn-lg md:px-4"
            >
              {"omitted" in p ? "…" : p.page}
            </a>
          ))}
          <a
            href={pagination.next ?? undefined}
            className="btn btn-sm px-1.5 md:btn-lg md:px-4"
          >
            {"後へ"}
          </a>
        </nav>
      </div>
    </div>
  );
}
