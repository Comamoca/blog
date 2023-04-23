export default function Twemoji(props) {
  return (
    <>
      <img
        src={"https://emoji2svg.deno.dev/api/" + props.emoji}
        className="pb-2 w-16 h-16 md:w-20 md:h-20"
      />
    </>
  );
}
