import { parse } from "date-fns";
import { expandGlob } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";
import { extract } from "jsr:@std/front-matter/yaml";
import { assert, assertEquals } from "jsr:@std/assert";

type FrontMatter = {
  title: string;
  description: string;
  pubDate: string;
  emoji: string;
  tags: Array<string>;
  draft: boolean;
};

Deno.test("Check date formats at blog posts", async () => {
  const postFiles = await Array.fromAsync(expandGlob("./src/blog/*.md"));

  postFiles.map(async (file) => {
    const content = await Deno.readTextFile(file.path);
    const frontMatterText = extract(content).frontMatter;
    const frontMatter = parseYaml(frontMatterText) as FrontMatter;
    const fileNameYYMMDD = file.name.slice(0, 10);

    const pubDate = frontMatter.pubDate;

    // Check date from slug
    const parsedfileNameYYMMDD = parse(
      fileNameYYMMDD,
      "yyyy-MM-dd",
      new Date(),
    );
    assert(parsedfileNameYYMMDD);

    // Check date format at pubDate
    const parsedPubDate = parse(pubDate, "MMM d yyyy", new Date());
    assert(parsedPubDate);

    // Is same to slug date and frontmatter date
    assertEquals(
      parsedfileNameYYMMDD,
      parsedPubDate,
      `slug date and pubDate does not match. Please check frontMatter and slug at ${file.path}`,
    );
  });
});
