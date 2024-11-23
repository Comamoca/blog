import { SITE_DESCRIPTION, SITE_TITLE } from "./consts.ts";
import BaseHead from "./components/BaseHead.tsx";
import PostCard from "./components/PostCard.tsx";

export const title = "Hub";
export const layout = "layouts/main.tsx";
export const openGraphLayout = "layouts/mainOgImage.tsx";
export const metas = {
  title: "=title",
  description: SITE_DESCRIPTION,
};

type HubLink = {
  title: string;
  link: URL;
  description: string;
};

const resources: Array<HubLink> = [
  {
    title: "Note",
    link: new URL("https://note.comamoca.dev/"),
    description: "プログラミング言語からVRChatまで知見を幅広いメモがあります。",
  },
  {
    title: "gleam-jp Scrapbox",
    link: new URL("https://scrapbox.io/gleam-jp"),
    description:
      "gleam-jpというお一人様orgのScrapboxです。ドキュメントに見当たらなかった情報やライブラリ固有の情報などをまとめています。",
  },
  {
    title: "dotfiles",
    link: new URL("https://github.com/comamoca/dotfiles"),
    description: "僕のdotfilesです。NixOS/Hyprland構成で書かれています。",
  },
  {
    title: "scaffold",
    link: new URL("https://github.com/comamoca/scaffold"),
    description: "僕がプロジェクトを作る時に使っているテンプレート集です。",
  },
  {
    title: "starter",
    link: new URL("https://github.com/Comamoca/starter"),
    description:
      "kickstartというツールで展開できるテンプレートを載せているリポジトリです。",
  },
  {
    title: "nur-packages",
    link: new URL("https://github.com/Comamoca/nur-packages"),
    description: "独自にNixでパッケージングしたものを集めたレジストリです。",
  },
  // {
  //         title: "",
  //         link: new URL(""),
  //         description: ""
  // },
];

export default function () {
  return (
    <>
      <BaseHead title={title} description={SITE_DESCRIPTION} />
      <main className="mt-5">
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl px-auto mx-auto">
            Hub
          </h2>

          <p className="p-10 mx-auto">
            自分が書いた情報やテンプレートなど、自身がよく引用するリソースの一覧です。
          </p>
          <ul className="flex flex-col justify-center mx-10 md:mx-auto">
            {resources.map((item) => {
              return (
                <div className="p-3">
                  <PostCard
                    slug={item.link}
                    title={item.title}
                    description={item.description}
                  />
                </div>
              );
            })}
          </ul>
        </div>
      </main>
    </>
  );
}
