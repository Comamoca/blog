import Logo from "../../src/_components/Logo.tsx";
import PostList from "../../src/_components/PostList.tsx";
import Twemoji from "../../src/_components/Twemoji.tsx";
import type { Pagination, PostSummary } from "./types.ts";

export default function DiaryPage(
  { posts, pagination }: { posts: PostSummary[]; pagination: Pagination },
) {
  return (
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
        <PostList pages={posts} isDiary={true} />
        <div className="inline-flex flex-row justify-center py-1">
          {pagination.previous
            ? (
              <a
                href={pagination.previous}
                className="btn text-xl px-4"
              >
                {pagination.page - 1}
              </a>
            )
            : (
              <span className="pt-1 text-xl">
                <Twemoji emoji="🦊" size={10} />
              </span>
            )}

          <span className="my-auto mx-2">/</span>

          {pagination.next
            ? (
              <a
                href={pagination.next}
                className="btn text-xl px-4"
              >
                {pagination.page + 1}
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
  );
}
