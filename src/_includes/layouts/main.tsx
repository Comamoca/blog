import Twemoji from "../../components/Twemoji.tsx";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";
import { SITE_TITLE } from "../../consts.ts"

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
          <main>
            <div className="flex justify-center">
              <div className="flex flex-col mt-8">
                <h1 className="text-3xl md:text-4xl mx-auto mt-8">{SITE_TITLE}</h1>
              </div>
            </div>
            <div className="ml-20 mr-20 mt-12 text-lg mt-10">
	      <div className="flex flex-col justify-center">
	      {children}
	      </div>
            </div>
          </main>
          <Footer />
        </body>
      </html>
    </>
  );
}
