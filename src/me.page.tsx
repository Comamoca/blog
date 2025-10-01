import { SITE_DESCRIPTION, SITE_TITLE } from "./consts.ts";
// import BaseHead from "./_components/BaseHead.tsx";

export const title = "About Me";
export const url = "/me.html";
export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: "=title",
  description: SITE_DESCRIPTION,
};

const links: Array<{ link: string; name: string }> = [
  { link: "https://bsky.app/profile/comamoca.dev", name: "Bluesky" },
  {
    link:
      "https://nostx.io/npub1f0xqy2qs5lhl2u035qszfne6sdw8jkh3px6we2c3u3gxy2v3g8tsvkn2qr",
    name: "Nostr",
  },
  { link: "https://twitter.com/Comamoca_", name: "Twitter" },
  {
    link:
      "https://vrchat.com/home/user/usr_695212b9-72ea-4503-8109-47eb12d02a5d",
    name: "VRChat",
  },
  { link: "https://discord.com/users/comamoca", name: "Discord" },
  { link: "https://wakatime.com/@Comamoca", name: "Wakatime" },
];

export default async function ({ comp }: Lume.Data) {
  return (
    <>
      <comp.BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />

      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js" />
      <img
        src="https://r2.comamoca.dev/icon.png"
        className="mx-auto h-32 w-32 rounded-full md:mb-6 mt-8 md:mt-2"
      />

      <main>
        <h1 className="text-2xl md:text-4xl text-center my-4">About Me</h1>
        <article className="prose flex justify-center mx-auto">
          <div className="border(t gray-200) w-96 m-3 p-4">
            <div className="block p-4 bg-white rounded-lg border border-gray-200 shadow md:p-6">
              <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Comamoca
              </h5>
              <p className="font-normal text-gray-700">
                わんだふる〜！

                <ul>
                  <li>Gleam</li>
                  <li>Common Lisp</li>
                  <li>Nix</li>
                  <li>Deno</li>
                  <li>Nim</li>
                </ul>

                が好きです。 <br>
                普段はNixOSとEmacsでコードを書いています。

                <h3>Links</h3>

                <div className="flex flex-wrap">
                  {links.map((link: { link: string; name: string }) => {
                    return <a href={link.link} className="px-1">{link.name}</a>;
                  })}
                </div>
              </p>
            </div>
            <img
              data-confetti-button
              width="70"
              src="https://emoji2svg.deno.dev/api/🎉"
              alt="party popper emoji button"
              className="mx-auto border rounded p-5"
            />
          </div>
        </article>
      </main>

      <script>
        {`
  const buttons = document.querySelectorAll('[data-confetti-button]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => confetti());
  });`}
      </script>
    </>
  );
}
