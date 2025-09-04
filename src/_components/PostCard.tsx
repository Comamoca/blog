interface PostCardProps {
  title: string;
  description: string;
  slug: string;
  isDiary?: boolean;
}

export default function PostCard(props: PostCardProps) {
  const { title, description, slug, isDiary } = props;
  const style = isDiary
    ? "flex flex-grow border(t gray-200) w-full max-w-sm md:max-w-3xl"
    : "flex flex-grow border(t gray-200) w-full max-w-md md:max-w-3xl";

  return (
    <div className={style}>
      <a
        href={slug}
        className="w-full block bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-100"
        title={title}
      >
        {/* dark:text-white */}
        <div className="text-lg md:text-2xl py-1 md:py-2 px-3 font-bold tracking-tight text-gray-900">
          {title}
        </div>
        <p className="font-normal py-1 md:py-2 px-3 text-gray-700 text-sm md:text-base">
          {description}
        </p>
      </a>
    </div>
  );
  // .slice(0, 20)
}
