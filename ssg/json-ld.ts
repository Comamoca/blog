/**
 * schema.org JSON-LD の組み立て。
 *
 * agent-readiness系スキャナ (is-agentic.com 等) がJSON-LD構造化データの
 * 有無・エンティティリンク(sameAs)・Organization/Person completenessを見るため、
 * 全ページ共通のPerson/著者情報と、サイト全体のWebSite・記事のBlogPostingを出す。
 */
import { format, parse } from "date-fns";
import { AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../src/consts.ts";

export const AUTHOR_SAME_AS = [
  "https://github.com/Comamoca",
  "https://twitter.com/Comamoca_",
  "https://bsky.app/profile/comamoca.dev",
  "https://nostx.io/npub1f0xqy2qs5lhl2u035qszfne6sdw8jkh3px6we2c3u3gxy2v3g8tsvkn2qr",
  "https://wakatime.com/@Comamoca",
];

const PERSON_ID = `${SITE_URL}/me#person`;

function person() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: AUTHOR,
    url: `${SITE_URL}/me`,
    sameAs: AUTHOR_SAME_AS,
  };
}

/** トップ・固定ページ用: WebSite + Person */
export function siteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "ja",
        author: { "@id": PERSON_ID },
      },
      person(),
    ],
  };
}

/** 記事ページ用: BlogPosting */
export function postJsonLd(args: {
  title: string;
  description: string;
  url: string;
  pubDate: string;
  image: string;
}): object {
  const { title, description, url, pubDate, image } = args;
  let datePublished: string | undefined;
  if (pubDate) {
    const parsed = parse(pubDate, "MMM d yyyy", new Date());
    if (!Number.isNaN(parsed.getTime())) {
      datePublished = format(parsed, "yyyy-MM-dd");
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: url,
    headline: title,
    description,
    inLanguage: "ja",
    ...(datePublished ? { datePublished } : {}),
    image,
    author: person(),
    publisher: person(),
  };
}
