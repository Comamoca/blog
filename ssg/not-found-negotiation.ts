/**
 * 404のコンテンツネゴシエーション。
 *
 * Cloudflare Pagesの not_found_handling は常に dist/404.html (text/html) を
 * 返す仕組みで、Acceptヘッダによる出し分けができない。そのため
 * functions/_middleware.ts からこの純粋関数を呼び、Accept: text/markdown /
 * application/json を望むエージェント向けに本文だけを差し替える
 * (HTTPステータスは404のまま変えない)。
 */

export const LLMS_TXT_URL = "https://comamoca.dev/llms.txt";
export const SITEMAP_MD_URL = "https://comamoca.dev/sitemap.md";

export type NegotiatedNotFound = {
  status: 404;
  headers: Record<string, string>;
  body: string;
};

function accepts(accept: string, mimeType: string): boolean {
  return accept.toLowerCase().includes(mimeType);
}

function markdownNotFound(pathname: string): NegotiatedNotFound {
  const body =
    `# 404 Not Found\n\n` +
    `\`${pathname}\` はこのサイトに存在しません。削除された、または移動した可能性があります。\n\n` +
    `[Sitemap](${SITEMAP_MD_URL}) または [llms.txt](${LLMS_TXT_URL}) からページを探してください。\n`;
  return {
    status: 404,
    headers: { "content-type": "text/markdown; charset=utf-8", vary: "Accept" },
    body,
  };
}

function jsonNotFound(pathname: string): NegotiatedNotFound {
  const body = JSON.stringify({
    error: {
      code: "not_found",
      status: 404,
      message: `${pathname} はこのサイトに存在しません。`,
      resolution: "sitemap.md または llms.txt でページ一覧を確認してください。",
      docs: LLMS_TXT_URL,
    },
  });
  return {
    status: 404,
    headers: { "content-type": "application/json; charset=utf-8", vary: "Accept" },
    body,
  };
}

/**
 * accept: リクエストの Accept ヘッダの値 (無ければ null)。
 * pathname: リクエストパス。
 *
 * 戻り値が null の場合、呼び出し側は何もせず既定のHTML 404を素通りさせる。
 */
export function negotiateNotFound(
  accept: string | null,
  pathname: string,
): NegotiatedNotFound | null {
  const a = accept ?? "";

  if (accepts(a, "application/json")) return jsonNotFound(pathname);
  if (accepts(a, "text/markdown")) return markdownNotFound(pathname);
  // /api/* はHTML向けページを持たないため、Acceptが未指定・曖昧な場合も
  // JSONを既定にする (agent-ready.devの「JSON error responses」チェック対象)。
  if (pathname.startsWith("/api/")) return jsonNotFound(pathname);

  return null;
}
