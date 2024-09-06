import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../../consts";
import { marked } from "marked";


const postImportResult = import.meta.glob("../../content/blog/*.md", {
  eager: true,
});

const posts = Object.values(postImportResult);

function getContent(post) {
  const content = post.rawContent();
  const html = marked(content);

  return String(html);
}

// console.log(getContent(posts[0]));

export const get = () =>
  rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      link: `/blog/${post.file.split("/").reverse()[0].split(".")[0]}`,
      title: post.frontmatter.title,
      pubDate: post.frontmatter.pubDate,
      description: post.description,
      customData: `
      <language>ja-jp</language>
      <summary>${getContent(post)}</summary>
      `,
    })),
  });
