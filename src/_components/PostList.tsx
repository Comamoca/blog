import PostCard from "./PostCard.tsx";

interface PostListProps {
  comp?: any;
  pages?: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  helpers?: any;
  isDiary?: boolean;
}

export default function PostList(
  { comp, pages = [], helpers, isDiary }: PostListProps,
) {
  return (
    <>
      {pages.map((page, idx) => (
        <div
          key={idx}
          className="flex flex-grow justify-center md:w-8/12 md:mx-5 "
        >
          <PostCard
            title={page.title}
            slug={page.url}
            description={page.description}
            isDiary={isDiary}
          />
        </div>
      ))}
    </>
  );
}
