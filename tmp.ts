import { groupBy } from "jsr:@es-toolkit/es-toolkit";
import { is } from "jsr:@core/unknownutil";
import { expandGlob } from "jsr:@std/fs";
import { basename } from "jsr:@std/path";
import { format } from "npm:date-fns";

const globPost = "./src/blog/*.md";

const entries = await Array.fromAsync(expandGlob(globPost));

const articleDate = entries.map((entry) => basename(entry.path))
  .map((name) => name.slice(0, 10));

const grouped = groupBy(articleDate, (item) => item);

const now = new Date();
const today = format(now, "yyyy-MM-dd");

const todayPost = grouped[today];

console.log(grouped);
