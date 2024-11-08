export default function (
  { title, children }: Lume.Data,
  helpers: Lume.Helpers,
) {
  return (
    <>
      <html lang="ja">
        <head>
          <meta charSet="UTF-8" />
          <title>{title}</title>
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          {children}
        </body>
      </html>
    </>
  );
}
