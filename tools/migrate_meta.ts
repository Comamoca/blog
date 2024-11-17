import { extract } from "jsr:@std/front-matter/any";
import { expandGlob } from "jsr:@std/fs";
import { stringify } from "npm:yaml";
import { type Extract } from "jsr:@std/front-matter/any";
import { type WalkEntry } from "jsr:@std/fs";

type FrontMatter = {
  title: string;
  description: string;
  pubDate: string;
  emoji: string;
  tags: string[];
  published: boolean;
};

const matter = (attr: string) => `---\n${attr}---\n`;

async function swapMatters(entry: WalkEntry) {
  const txt = await Deno.readTextFile(entry.path);
  const md: Extract<FrontMatter> = extract(txt);
  const { published, ...attrs } = md.attrs;

  // `published`を`draft`に置換
  const yamlStr = stringify({ ...attrs, draft: published ? false : true });

  // 文字列に戻す
  const mdStr = [matter(yamlStr), md.body].join("\n");

  // 書き込み
  await Deno.writeTextFile(entry.path, mdStr);
  // return mdStr;
}

const pages = await Array.fromAsync(expandGlob("./src/blog/*.md"));

const result = pages
  .map(swapMatters);

await Promise.all(result);
