import PostCard from "./PostCard.tsx";

export default ({ comp, pages = [], helpers, isDiary }) => {
  return (
    <>
      {pages.map((page, idx) => {
        return (
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
        );
      })}
    </>
  );
};
