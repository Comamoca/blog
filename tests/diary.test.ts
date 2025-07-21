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

const postFiles = await Array.fromAsync(expandGlob("./src/blog/*.md"));

postFiles
  .filter((entry) => entry.name.startsWith("flycheck_") == false)
  .map(async (file) => {
    const content = await Deno.readTextFile(file.path);
    const frontMatterText = extract(content).frontMatter;
    const frontMatter = parseYaml(frontMatterText) as FrontMatter;
    const fileNameYYMMDD = file.name.slice(0, 10);

    const pubDate = frontMatter.pubDate;

    const parsedfileNameYYMMDD = parse(
      fileNameYYMMDD,
      "yyyy-MM-dd",
      new Date(),
    );
    assert(parsedfileNameYYMMDD);

    const parsedPubDate = parse(pubDate, "MMM d yyyy", new Date());
    assert(parsedPubDate);

    assertEquals(
      parsedfileNameYYMMDD,
      parsedPubDate,
      `slug date and pubDate does not match. Please check frontMatter and slug at ${file.path}`,
    );
  });
