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
