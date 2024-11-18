export default function Twemoji({ emoji, size = 20 }) {
  const url = new URL("https://emoji2svg.deno.dev");
  url.pathname += `api/${emoji}`;

  const style = `size-${size} md:size-${size + 8}`;

  return (
    <>
      <img
        src={url.toString()}
        className={style}
      />
    </>
  );
}
