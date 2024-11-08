export default function Twemoji(props) {
  return (
    <>
      <img
        src={"https://emoji2svg.deno.dev/api/" + props.emoji}
        className="pb-2 size-38 md:size-28"
      />
    </>
  );
}
