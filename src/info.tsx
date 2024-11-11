export const layout = "layouts/post.tsx";
export const templateEngine = "jsx";

export const title = "このブログについて";
export const emoji = "❓";

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
        <li>Astro</li>
        <span>MIT License</span>

        <li>Tailwind CSS</li>
        <span>MIT License</span>

        <li>Lucide</li>
        <span>ISC License</span>
      </ul>

      <h3>バックエンド</h3>

      <ul>
        <li>CloudFlare Pages</li>
        <li>CooudFlare R2(画像配信)</li>
      </ul>
    </>
  );
}
