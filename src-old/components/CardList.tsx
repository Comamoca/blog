export default function CardList(props: { posts }) {
  const posts = props.posts;

  return <div className={"flex flex-col items-center mt-3"}>{posts}</div>;
}
