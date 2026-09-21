// import Twemoji from "../../components/Twemoji.tsx";
// import Header from "../../components/Header.tsx";
// import Footer from "../../components/Footer.tsx";
import { SITE_TITLE } from "../../consts.ts";

export default (
  { title, children, comp }: Lume.Data,
  helpers: Lume.Helpers,
) => {
  return (
    <html lang="ja">
      <head>
        {/*<BaseHead title={title} description={description} />*/}
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="/style.css" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </head>
      <body>
        <comp.Header />
        {children}
        <comp.Footer />
        <script src="/pagefind/pagefind-ui.js" data-cfasync="false"></script>
        <script data-cfasync="false">
          {`let pagefindAttempts = 0;

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
              // Retry after a short delay if PagefindUI is not yet loaded.
              // Give up after ~5s: dev builds don't emit the pagefind bundle
              // (it is gated on RELEASE), so retrying forever would spin the
              // timer at 10Hz for the whole session.
              if (++pagefindAttempts < 50) {
                setTimeout(initializePagefind, 100);
              }
            }
          }

          window.addEventListener('DOMContentLoaded', initializePagefind);
          
          // Also try to initialize immediately in case DOMContentLoaded already fired
          if (document.readyState === 'loading') {
            // Document still loading, DOMContentLoaded will fire
          } else {
            // Document already loaded, initialize immediately
            initializePagefind();
          }`}
        </script>
      </body>
    </html>
  );
};
