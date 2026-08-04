import { assert } from "jsr:@std/assert";

function isMidnight(date: Date): boolean {
  return date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0;
}

async function buildSite(): Promise<void> {
  const build = new Deno.Command("deno", {
    args: ["task", "lume"],
    stdout: "piped",
    stderr: "piped",
  });
  const { success, stderr } = await build.output();
  if (!success) {
    throw new Error(`Site build failed: ${new TextDecoder().decode(stderr)}`);
  }
}

async function gitHeadTimestamp(): Promise<number> {
  const cmd = new Deno.Command("git", {
    args: ["log", "-1", "--format=%ct"],
    stdout: "piped",
  });
  const { stdout } = await cmd.output();
  return parseInt(new TextDecoder().decode(stdout).trim(), 10);
}

// Build once before the assertions below run.
await buildSite();
const feedXml = await Deno.readTextFile("./_site/api/feed.xml");

Deno.test("RSS feed lastBuildDate matches latest git commit time", async () => {
  const lastBuildMatch = feedXml.match(
    /<lastBuildDate>([^<]+)<\/lastBuildDate>/,
  );
  assert(lastBuildMatch, "<lastBuildDate> must exist in feed.xml");

  const lastBuildDate = new Date(lastBuildMatch[1]);
  assert(
    !Number.isNaN(lastBuildDate.getTime()),
    `lastBuildDate ${lastBuildMatch[1]} must be a valid date`,
  );

  const expected = await gitHeadTimestamp();
  assert(
    lastBuildDate.getTime() === expected * 1000,
    `lastBuildDate ${lastBuildMatch[1]} must equal git HEAD commit time`,
  );

  assert(
    lastBuildDate <= new Date(),
    `lastBuildDate ${lastBuildMatch[1]} must not be in the future`,
  );
});

Deno.test("RSS feed item pubDate includes time", () => {
  const pubDateMatches = [
    ...feedXml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g),
  ];
  assert(
    pubDateMatches.length > 0,
    "feed.xml must contain at least one item pubDate",
  );

  let nonMidnight = 0;
  for (const match of pubDateMatches) {
    const pubDate = new Date(match[1]);
    assert(
      !Number.isNaN(pubDate.getTime()),
      `pubDate ${match[1]} must be a valid date`,
    );
    if (!isMidnight(pubDate)) {
      nonMidnight++;
    }
  }

  assert(
    nonMidnight > 0,
    "at least one pubDate must include a non-midnight time component",
  );
});

// Every item's pubDate day must match the date embedded in its URL, which is
// derived from the filename. This guards against git commit dates leaking
// into pubDates and re-flooding old posts as "new" on RSS readers.
Deno.test("RSS feed item pubDate day matches its URL date", () => {
  const itemMatches = [
    ...feedXml.matchAll(/<item>([\s\S]*?)<\/item>/g),
  ];
  assert(itemMatches.length > 0, "feed.xml must contain items");

  let checked = 0;
  for (const item of itemMatches) {
    const url = item[1].match(/<link>([^<]*)<\/link>/)?.[1];
    const pubDate = item[1].match(/<pubDate>([^<]*)<\/pubDate>/)?.[1];
    if (!url || !pubDate) {
      continue;
    }

    // URL is built from pubDate (see src/blog/_data.js), so extract the date
    // from the URL path: /blog/2026-08-02-i-no-sumika/
    const urlDate = url.match(/\/blog\/(\d{4}-\d{2}-\d{2})-/)?.[1];
    assert(
      urlDate,
      `URL ${url} must contain a YYYY-MM-DD date`,
    );

    const pubDateDay = new Date(pubDate).toISOString().slice(0, 10);
    assert(
      pubDateDay === urlDate,
      `pubDate ${pubDate} must match URL date ${urlDate} for ${url}`,
    );
    checked++;
  }

  assert(checked > 0, "at least one item must have both URL and pubDate");
});
