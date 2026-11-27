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
      <p className="text-center text-gray-600 mt-2 mb-8 max-w-xl mx-auto text-base">
        プログラミング言語・NixOS・Emacs・自作キーボードなど、気になった技術を触ってみた記録を
        中心に書いているブログです。技術記事に加えて、日々の出来事を綴った日報(日記)も公開しています。
        新しい記事やメモは不定期に追加していく予定なので、興味があれば
        <a href="/api/feed.xml" className="underline">
          RSS
        </a>
        などで更新を追えます。
      </p>
      <div className="flex md:items-center flex-col gap-6 grid-cols-4">
        <PostList pages={posts.slice(0, 8)} />
        <PostCard title="全ての技術記事" description="全ての技術記事はこちらから" slug="/tech/1" />
        <PostCard title="全ての記事" description="全ての記事はこちらから" slug="/all/1" />
        <PostCard
          title="API & Agent Tools"
          description="MCPツール・APIエンドポイントのドキュメント"
          slug="/mcp.html"
        />
      </div>
    </div>
  );
}
