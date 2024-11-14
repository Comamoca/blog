import Twemoji from "../../components/Twemoji.tsx";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";

export default function (
  data: Lume.Data,
  helpers: Lume.Helpers,
) {
  const { title, children, pubDate, emoji, content } = data;

  return (
    <>
      <html lang="ja">
        <head>
          {/* <BaseHead title={title} description={description} />  */}
          <meta charSet="UTF-8" />
          <title>{title}</title>
          <link rel="stylesheet" href="/style.css" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <script src="https://embed.zenn.studio/js/listen-embed-event.js">
          </script>
        </head>
        <body>
          <Header />
          <main>
            <div className="justify-center">
              <div className="flex flex-col mt-6">
                <div className="mx-auto mb-3">
                  {/* TODO: ちゃんとfrontmatterの絵文字を取得するようにする */}
                  <Twemoji emoji={emoji} />
                </div>
                {/*  md:text-2xl md:text-4xl md:mx-auto */}
                <h1 className="text-xl md:text-3xl mx-auto">
                  {title}
                </h1>
                <div className="flex flex-col mt-3 mx-auto">
                  {/* <FormattedDate date={pubDate} /> */}
                  {/* <spam className="md:ml-2">読み終わるまでの目安 約{minitesRead}分</spam> */}
                </div>
              </div>
            </div>
            <hr className="w-4/6 h-1 mx-auto my-2 bg-gray-100 border-0 rounded my-10" />
            <div className="mt-12 flex justify-center">
              <div className="flex justify-center mx-10">
                <article className="max-w-xs md:max-w-3xl prose md:prose-md prose-ul:list-disc">
                  {children}
                </article>
              </div>
            </div>
          </main>
          <Footer />
        </body>
      </html>
    </>
  );
}
