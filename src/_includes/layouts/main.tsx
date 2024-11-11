import Twemoji from "../../components/Twemoji.tsx";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";
import { SITE_TITLE } from "../../consts.ts";

export default function (
  { title, children }: Lume.Data,
  helpers: Lume.Helpers,
) {
  return (
    <>
      <html lang="ja">
        <head>
          {/*<BaseHead title={title} description={description} />*/}
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          <Header />
          <div className="ml-20 mr-20 mt-12 text-lg mt-10">
            {children}
          </div>
          <Footer />
        </body>
      </html>
    </>
  );
}
