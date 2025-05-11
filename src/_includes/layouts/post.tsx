import Twemoji from "../../_components/Twemoji.tsx";
import Header from "../../_components/Header.tsx";
import Footer from "../../_components/Footer.tsx";
import { format, parse } from "date-fns";
import ja from "date-fns/locale/ja";

function yymmdd(date: string): string {
  if (typeof date === "undefined") {
    return "";
  }

  const datetime = parse(date, "MMM d yyyy", new Date());
  return format(datetime, "yyyy年M月d日", { locale: ja });
}

export default function (
  data: Lume.Data,
  helpers: Lume.Helpers,
) {
  const { title, children, pubDate, emoji, content } = data;

  const npub =
    "npub1f0xqy2qs5lhl2u035qszfne6sdw8jkh3px6we2c3u3gxy2v3g8tsvkn2qr";

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
          <script defer src="https://cdn.jsdelivr.net/npm/nostr-zap@latest">
          </script>
          <script defer src="https://cdn.jsdelivr.net/npm/nostr-zap-view@1.3.4">
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
                <h1 className="text-xl mx-auto md:text-3xl">
                  {title}
                </h1>
                <div className="flex flex-col mt-3 mx-auto">
                  {/* <FormattedDate date={pubDate} /> */}
                  {/* <spam className="md:ml-2">読み終わるまでの目安 約{minitesRead}分</spam> */}
                  <spam>{yymmdd(pubDate)}</spam>
                </div>
              </div>
            </div>
            <hr className="w-4/6 h-1 mx-auto my-2 bg-gray-100 border-0 rounded my-10" />
            <div className="mt-12 flex justify-center">
              <div className="flex flex-col justify-center mx-10">
                <article
                  className="max-w-xs md:max-w-3xl prose md:prose-lg prose-ul:list-disc"
                  transform-images="webp 500@2"
                >
                  {children}
                </article>
                <hr className="w-4/6 h-1 mx-auto my-2 bg-gray-100 border-0 rounded my-10" />
                <div className="flex justify-center grid grid-cols-2 md:grid-cols-4 gap-2 py-5">
                  {/* justify-around */}
                  <a
                    className="btn btn-sm md:btn-md"
                    href="https://ko-fi.com/comamoca"
                  >
                    <span className="text-xs md:text-base">ko-fi ☕</span>
                  </a>
                  <a
                    className="btn btn-sm md:btn-md"
                    href="https://github.com/sponsors/Comamoca"
                  >
                    <span className="text-xs md:text-base">
                      GitHub Sponsors 🐙
                    </span>
                  </a>

                  <button
                    className="btn btn-sm md:btn-md"
                    data-npub={npub}
                    data-relays="wss://relay.damus.io,wss://relay.snort.social,wss://nostr.wine,wss://relay.nostr.band"
                  >
                    <span className="text-xs md:text-base">Zap Me ⚡️</span>
                  </button>

                  <button
                    className="btn btn-sm md:btn-md"
                    data-title=""
                    data-nzv-id={npub}
                    data-zap-color-mode="true"
                    data-relay-urls="wss://relay.nostr.band,wss://relay.damus.io,wss://nos.lol,wss://nostr.bitcoiner.social,wss://relay.nostr.wirednet.jp,wss://yabu.me"
                  >
                    <span className="text-xs md:text-base">View zaps 👀</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
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
}
