import { SITE_DESCRIPTION } from "./consts.ts";

export const layout = "layouts/post.tsx";
export const templateEngine = "jsx";
export const ogLayout = "post";
export const url = "/info.html";

export const title = "このブログについて";
export const emoji = "❓";
export const metas = {
  title: "=title",
  description: SITE_DESCRIPTION,
};

export default function () {
  return (
    <>
      <h2>ライセンス</h2>

      <h3>記事のライセンス</h3>

      このブログの記事は<a
        rel="license"
        href="http://creativecommons.org/licenses/by/4.0/"
      >
        クリエイティブ・コモンズ 表示 4.0 国際 ライセンス
      </a>の下に提供されています。

      <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
        <img
          alt="クリエイティブ・コモンズ・ライセンス"
          // style="border-width: 0"
          src="https://i.creativecommons.org/l/by/4.0/88x31.png"
        />
      </a>

      <h2>使用したライブラリ・フレームワークについて</h2>

      <h3>フロントエンド</h3>
      <ul>
        <li>
          <a href="https://lume.land/">Lume</a>
        </li>

        <li>
          <a href="https://tailwindcss.com/">Tailwind CSS</a>
        </li>

        <li>
          <a href="https://lucide.dev/">Lucide</a>
        </li>
      </ul>

      <h3>バックエンド</h3>

      <ul>
        <li>CloudFlare Pages</li>
        <li>CooudFlare R2(画像配信)</li>
      </ul>

      <h3>OGP生成</h3>
      <ul>
        <li>
          <a href="https://github.com/satorijs/satori">Satori</a>
        </li>
      </ul>

      <h2>フォント</h2>
      <ul>
        <li>さわらびゴシック</li>
        SIL Open Font License, Version 1.1

        <li>Noto Sans Japanese</li>
        SIL Open Font License, Version 1.1
      </ul>

      <h2>絵文字</h2>
      <p>
        当サイトの絵文字は<a href="https://github.com/twitter/twemoji">
          Twemoji
        </a>のグラフィックをSVGに変換して使用しています。
      </p>
      <p>
        Twemoji graphicsは Copyright Twitter, Inc and other contributors
        が権利を保有し、
        <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">
          Creative Commons Attribution 4.0 International License
        </a>の下で提供されています。
      </p>

      <h2>OGP画像の背景について</h2>
      <p>
        当サイトで設定しているOGP画像の背景には、<a href="https://discord.com/invite/sgSdejpp3Z">
          学園アイドルマスター公式Discord
        </a>にて配布されている素材に画像縮小の編集を施したものを使用しています。
      </p>
    </>
  );
}
