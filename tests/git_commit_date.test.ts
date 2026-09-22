import { assert, assertEquals } from "jsr:@std/assert";
import { getLatestArticleCommitDate } from "../plugins/git_commit_date.ts";

async function git(cwd: string, args: string[]): Promise<string> {
  const cmd = new Deno.Command("git", { args, cwd, stdout: "piped" });
  const { stdout } = await cmd.output();
  return new TextDecoder().decode(stdout).trim();
}

Deno.test("returns the date of the latest commit that added an article", async () => {
  const expected = parseInt(
    await git(Deno.cwd(), [
      "log",
      "--diff-filter=A",
      "-1",
      "--format=%ct",
      "--",
      "src/blog",
    ]),
    10,
  );
  const date = getLatestArticleCommitDate();
  assertEquals(date.getTime(), expected * 1000);
});

Deno.test("ignores commits that only modify an existing article", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await git(dir, ["init", "-q"]);
    await git(dir, ["config", "user.email", "test@example.com"]);
    await git(dir, ["config", "user.name", "test"]);
    await Deno.mkdir(`${dir}/src/blog`, { recursive: true });

    await Deno.writeTextFile(`${dir}/src/blog/2026-01-01-post.md`, "first");
    await git(dir, ["add", "."]);
    await git(dir, ["commit", "-q", "-m", "add post"]);
    const added = getLatestArticleCommitDate(dir);

    // A later commit that edits the post — and one that touches an unrelated
    // file — must not move the feed's <lastBuildDate>.
    await Deno.writeTextFile(`${dir}/src/blog/2026-01-01-post.md`, "edited");
    await Deno.writeTextFile(`${dir}/README.md`, "readme");
    await git(dir, ["add", "."]);
    await git(dir, [
      "commit",
      "-q",
      "--date=2030-01-01T00:00:00Z",
      "-m",
      "edit post",
    ]);

    assertEquals(getLatestArticleCommitDate(dir).getTime(), added.getTime());
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("falls back to the current date outside a repository", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const before = Date.now();
    const date = getLatestArticleCommitDate(dir);
    const after = Date.now();
    assert(
      date.getTime() >= before && date.getTime() <= after,
      "fallback date must be approximately now",
    );
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
