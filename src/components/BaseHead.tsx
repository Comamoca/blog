// Import the global.css file here so that it is included on
// all pages through the use of the <BaseHead /> component.

// <meta name="generator" content={Astro.generator} />
//
// <link rel="canonical" href={canonicalURL} />
//       <title>{title}</title>
// <meta name="title" content={title} />
// <meta name="description" content={description}

export interface Props {
  title: string;
  description: string;
  image?: string;
}

// const canonicalURL = new URL(Astro.url.pathname, Astro.site);
// const { title, description, image = "/favicon.svg" } = Astro.props;

export default function () {
  return (
    <>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </>
  );
}
