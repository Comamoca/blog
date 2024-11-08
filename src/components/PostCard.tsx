export default function PostCard(props) {
  // props: { post }
  // const { post } = props;
  // const data = post.data;

  const { title, description, slug } = props;

  // console.log(description)

  return (
    <div className="border(t gray-200) w-70 md:w-100 m-3 p-4">
      <a
        href={slug}
        className="block p-3 max-w-sm bg-white rounded-lg border border-gray-200 shadow md:p-4 md:p-6 hover:bg-gray-100"
        title={title}
      >
        {/* dark:text-white */}
        <h3 className="mb-2 text-lg font-bold tracking-tight text-gray-900 md:text-xl md:text-2xl">
          {title}
        </h3>
        <p className="font-normal text-gray-700">
          {`${description}...`}
        </p>
      </a>
    </div>
  );
  // .slice(0, 20)
}
