export default function PostCard(props) {
  const { title, description, slug } = props;

  return (
    <div className="border(t gray-200) min-w-fit m-3 p-4">
      <a
        href={slug}
        className="block p-3 bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-100"
        title={title}
      >
        {/* dark:text-white */}
        <h3 className="mb-2 text-lg font-bold tracking-tight text-gray-900 md:text-2xl">
          {title}
        </h3>
        <p className="font-normal text-gray-700">
          {description}
        </p>
      </a>
    </div>
  );
  // .slice(0, 20)
}
