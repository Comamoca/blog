/**
 * Cloudflare Pages Function (全リクエストに適用される _middleware)。
 *
 * 唯一の役割は404のコンテンツネゴシエーション (ssg/not-found-negotiation.ts)。
 * 通常のレスポンス (200など) は context.next() の結果をそのまま返し、
 * 静的アセット配信の挙動を変えない。
 */
import { negotiateNotFound } from "../ssg/not-found-negotiation.ts";

type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
};

export async function onRequest(context: PagesContext): Promise<Response> {
  const response = await context.next();
  if (response.status !== 404) return response;

  const url = new URL(context.request.url);
  const negotiated = negotiateNotFound(context.request.headers.get("accept"), url.pathname);
  if (!negotiated) return response;

  return new Response(negotiated.body, {
    status: negotiated.status,
    headers: negotiated.headers,
  });
}
