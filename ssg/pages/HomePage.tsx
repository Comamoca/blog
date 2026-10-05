import Logo from "../../src/_components/Logo.tsx";
import PostList from "../../src/_components/PostList.tsx";
import PostCard from "../../src/_components/PostCard.tsx";
import type { PostSummary } from "./types.ts";

export default function HomePage({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="mx-8 text-lg md:mx-auto" data-pagefind-ignore>
      <div className="my-10 flex justify-center">
        <Logo />
      </div>
      <div className="flex md:items-center flex-col gap-6 grid-cols-4">
        <PostList pages={posts.slice(0, 8)} />
        <PostCard
          title="全ての技術記事"
          description="全ての技術記事はこちらから"
          slug="/tech/1"
        />
        <PostCard
          title="全ての記事"
          description="全ての記事はこちらから"
          slug="/all/1"
        />
      </div>
    </div>
  );
}
