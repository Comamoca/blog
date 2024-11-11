export default function PostCard(props) {
  const { title, description, slug, isDiary } = props;
  const style = isDiary
    ? "flex flex-grow border(t gray-200) w-full max-w-sm md:min-w-10"
    : "flex flex-grow border(t gray-200) w-full max-w-md md:min-w-10";

  return (
    <div className={style}>
      <a
        href={slug}
        className="w-full block bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-100"
        title={title}
      >
        {/* dark:text-white */}
        <h3 className="text-lg md:text-2xl py-1 md:py-2 px-3 font-bold tracking-tight text-gray-900">
          {title}
        </h3>
        <p className="font-normal py-1 md:py-2 px-3 text-gray-700 text-sm md:text-base">
          {description}
        </p>
      </a>
    </div>
  );
  // .slice(0, 20)
}
