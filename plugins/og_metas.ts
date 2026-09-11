/**
 * OGP画像のメタタグ生成プラグイン。
 *
 * ビルド時の画像生成 (satori) を廃止し、og:imageをCloudflare Workers
 * (og.comamoca.dev) の動的生成URLへ向ける。URLはtitle/descriptionを
 * クエリパラメータに持つコンテンツアドレス型で、コンテンツ変更時は
 * URL自体が変化するためキャッシュのpurgeは不要。
 *
 * ogLayout ("post" | "main") を持つページのみ対象。
 * 旧 postOgImage.tsx / mainOgImage.tsx の描画データ (title, description)
 * と80字切り詰めの挙動を引き継いでいる。
 */
import type Site from "lume/core/site.ts";
import { SITE_TITLE } from "../src/consts.ts";

export const OG_ORIGIN = "https://og.comamoca.dev";

export const MAX_DESCRIPTION_LENGTH = 80;

/** 旧 postOgImage.tsx の truncate を移植 */
export function truncateDescription(text: string): string {
  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH)}…`
    : text;
}

export function buildOgImageUrl(
  layout: string,
  title: string,
  description?: string,
  origin: string = OG_ORIGIN,
): string {
  const params: string[] = [
    `l=${encodeURIComponent(layout)}`,
    `t=${encodeURIComponent(title)}`,
  ];
  if (description) {
    params.push(`d=${encodeURIComponent(truncateDescription(description))}`);
  }
  return `${origin}/og.png?${params.join("&")}`;
}

export interface OgMetasOptions {
  /** og画像Workerのオリジン */
  origin?: string;
}

export function ogMetas(options: OgMetasOptions = {}) {
  const origin = options.origin ?? OG_ORIGIN;
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const layout = page.data.ogLayout;
        if (layout !== "post" && layout !== "main") continue;
        const title = typeof page.data.title === "string"
          ? page.data.title
          : SITE_TITLE;
        const description = typeof page.data.description === "string"
          ? page.data.description
          : undefined;
        page.data.metas ??= {};
        page.data.metas.image = buildOgImageUrl(
          layout,
          title,
          description,
          origin,
        );
      }
    });
  };
}
