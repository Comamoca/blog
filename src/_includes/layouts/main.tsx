import Header from "../../_components/Header.tsx";
import Footer from "../../_components/Footer.tsx";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, TWITTER_USERNAME } from "../../consts.ts";
import { PAGEFIND_INIT_SCRIPT } from "../../../ssg/pagefind-client.ts";
import { markdownUrlFor } from "../../../ssg/markdown-path.ts";
import { WEBMCP_SCRIPT } from "../../../ssg/webmcp-client.ts";
import { siteJsonLd } from "../../../ssg/json-ld.ts";
import { raw } from "@ox-content/vite-plugin";

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
  const { title, children, styles, description, ogImage, canonicalUrl } = data;

  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>{title}</title>
        {(styles ?? ["/style.css"]).map((href) => (
          <link rel="stylesheet" href={href} />
        ))}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={description ?? SITE_DESCRIPTION} />
        <meta name="generator" content="ox-content" />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {canonicalUrl ? (
          <link rel="alternate" type="text/markdown" href={markdownUrlFor(canonicalUrl)} />
        ) : null}
        <script type="application/ld+json">{raw(JSON.stringify(siteJsonLd()))}</script>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description ?? SITE_DESCRIPTION} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        {ogImage ? (
          <>
            <meta property="og:image" content={ogImage} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={TWITTER_USERNAME} />
          </>
        ) : null}
      </head>
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <script src="/pagefind/pagefind-ui.js" data-cfasync="false"></script>
        <script data-cfasync="false">{raw(PAGEFIND_INIT_SCRIPT)}</script>
        <script data-cfasync="false">{raw(WEBMCP_SCRIPT)}</script>
      </body>
    </html>
  );
};
