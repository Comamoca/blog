import Header from "../../_components/Header.tsx";
import Footer from "../../_components/Footer.tsx";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  TWITTER_USERNAME,
} from "../../consts.ts";

export interface MainLayoutData {
  title: string;
  children: unknown;
  /** ox-content: ctx.assets.ssrStylesheets() から得たhref一覧 */
  styles?: string[];
  /** ox-content: OGP用。未指定時はLume併存時の互換のため何も描画しない */
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export default (data: MainLayoutData) => {
  const {
    title,
    children,
    styles,
    description,
    ogImage,
    canonicalUrl,
  } = data;

  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>{title}</title>
        {(styles ?? ["/style.css"]).map((href) => (
          <link rel="stylesheet" href={href} />
        ))}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        {ogImage
          ? (
            <>
              <meta property="og:type" content="website" />
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
        {children}
        <Footer />
      </body>
    </html>
  );
};
