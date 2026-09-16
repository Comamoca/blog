import "../../style.css";
import Twemoji from "../../_components/Twemoji.tsx";
import Header from "../../_components/Header.tsx";
import Footer from "../../_components/Footer.tsx";
import { format, parse } from "date-fns";
import ja from "date-fns/locale/ja";
import { SITE_DESCRIPTION, SITE_URL, TWITTER_USERNAME } from "../../consts.ts";

function yymmdd(date: string): string {
  if (!date) {
    return "";
  }

  const datetime = parse(date, "MMM d yyyy", new Date());
  return format(datetime, "yyyy年M月d日", { locale: ja });
}

export interface PostLayoutData {
  title: string;
  children: unknown;
  pubDate: string;
  emoji: string;
  /** ox-content: ctx.assets.ssrStylesheets() から得たhref一覧 */
  styles?: string[];
  /** ox-content: OGP用。未指定時はLume併存時の互換のため何も描画しない */
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export default function (data: PostLayoutData) {
  const {
    title,
    children,
    pubDate,
    emoji,
    styles,
    description,
    ogImage,
    canonicalUrl,
  } = data;

  const npub =
    "npub1f0xqy2qs5lhl2u035qszfne6sdw8jkh3px6we2c3u3gxy2v3g8tsvkn2qr";

  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <title>{title}</title>
        {(styles ?? ["/style.css"]).map((href) => (
          <link rel="stylesheet" href={href} />
        ))}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <script defer src="https://cdn.jsdelivr.net/npm/nostr-zap@latest">
        </script>
        <script defer src="https://cdn.jsdelivr.net/npm/nostr-zap-view@1.3.4">
        </script>
        {ogImage
          ? (
            <>
              <meta property="og:type" content="article" />
              <meta property="og:title" content={title} />
              <meta
                property="og:description"
                content={description ?? SITE_DESCRIPTION}
              />
              {canonicalUrl
                ? <meta property="og:url" content={canonicalUrl} />
                : null}
              <meta property="og:image" content={ogImage} />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:site" content={TWITTER_USERNAME} />
              <meta
                name="description"
                content={description ?? SITE_DESCRIPTION}
              />
              <meta name="generator" content="ox-content" />
            </>
          )
          : null}
      </head>
      <body>
        <Header />
        <main>
          <div className="justify-center">
            <div className="flex flex-col mt-6">
              <div className="mx-auto mb-3">
                <Twemoji emoji={emoji} />
              </div>
              <h1 className="text-xl text-center mx-5 md:text-3xl">
                {title}
              </h1>
              <div className="flex flex-col mt-3 mx-auto">
                <spam>{yymmdd(pubDate)}</spam>
              </div>
            </div>
          </div>
          <hr className="w-4/6 h-1 mx-auto my-2 bg-gray-100 border-0 rounded my-10" />
          <div className="mt-12 flex justify-center">
            <div className="flex flex-col justify-center mx-10">
              <article className="max-w-xs md:max-w-3xl prose md:prose-lg prose-ul:list-disc">
                {children}
              </article>
              <hr className="w-4/6 h-1 mx-auto my-2 bg-gray-100 border-0 rounded my-10" />
              <div className="flex justify-center grid grid-cols-2 md:grid-cols-4 gap-2 py-5">
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
    </html>
  );
}
