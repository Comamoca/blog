export default function (
  { title, children, content }: Lume.Data,
  helpers: Lume.Helpers,
) {
  // console.log(children.props.dangerouslySetInnerHTML.__html)
  console.log(content);

  return (
    <>
      <html lang="ja">
        <head>
          <meta charSet="UTF-8" />
          <title>{title}</title>
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          <main>
            {content}
          </main>
        </body>
      </html>
    </>
  );
}

// <article className="prose" dangerouslySetInnerHTML={{__html: children}}>
// </article>
