/**
 * Pagefind UIの初期化スクリプト。main.tsx/post.tsxの両レイアウトから
 * 使う (レイアウトは互いに独立したトップレベル<html>なので共有できない)。
 *
 * devビルドでは `/pagefind/pagefind-ui.js` が生成されない
 * (ssg/pagefind.ts はビルド時のみ動く) ため、`PagefindUI` が未定義のまま
 * 永久に再試行しないよう、約5秒 (50回) で打ち切る。
 */
export const PAGEFIND_INIT_SCRIPT = `
let pagefindAttempts = 0;

function initializePagefind() {
  const searchElem = document.getElementById('search');
  if (searchElem && typeof PagefindUI !== 'undefined') {
    if (!searchElem.hasChildNodes()) {
      new PagefindUI({
        element: "#search",
        showImages: false,
        excerptLength: 30,
        showEmptyFilters: true,
        showSubResults: false,
        resetStyles: true,
        bundlePath: "/pagefind/",
        baseUrl: "/"
      });
    }
  } else if (typeof PagefindUI === 'undefined') {
    if (++pagefindAttempts < 50) {
      setTimeout(initializePagefind, 100);
    }
  }
}

window.addEventListener('DOMContentLoaded', initializePagefind);
if (document.readyState !== 'loading') {
  initializePagefind();
}
`;
