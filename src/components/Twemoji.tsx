export default function Twemoji(props) {
  const url = new URL("https://emoji2svg.deno.dev");
  url.pathname += `api/${props.emoji}`;

  return (
    <>
      <img
        src={url.toString()}
        className="pb-2 size-20 md:size-28"
      />
    </>
  );
}
