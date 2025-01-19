import Twemoji from "../../components/Twemoji.tsx";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";
import { SITE_TITLE } from "../../consts.ts";

export default (
  { title, children }: Lume.Data,
  helpers: Lume.Helpers,
) => {
  return (
    <>
      <html lang="ja">
        <head>
          {/*<BaseHead title={title} description={description} />*/}
          <link rel="stylesheet" href="/style.css" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          <Header />
          {children}
          <Footer />
        </body>
        {/*HACK: デプロイ時にPagefindのスクリプトが実行されないため追加した*/}
        <script
          dangerouslySetInnerHTML={{
            __html: `const elem = document.getElementById('search')
if (elem) {if (elem.children.length === 0) {new PagefindUI({"element":"#search","showImages":false,"excerptLength":0,"showEmptyFilters":true,"showSubResults":false,"resetStyles":true,"bundlePath":"/pagefind/","baseUrl":"/"});}}`,
          }}
        />
      </html>
    </>
  );
};
