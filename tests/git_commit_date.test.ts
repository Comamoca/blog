import { assert, assertEquals } from "jsr:@std/assert";
import { getLatestGitCommitDate } from "../plugins/git_commit_date.ts";

async function gitHeadTimestamp(cwd: string): Promise<number> {
  const cmd = new Deno.Command("git", {
    args: ["log", "-1", "--format=%ct"],
    cwd,
    stdout: "piped",
  });
  const { stdout } = await cmd.output();
  return parseInt(new TextDecoder().decode(stdout).trim(), 10);
}

Deno.test("returns the latest git commit date inside a repository", async () => {
  const expected = await gitHeadTimestamp(Deno.cwd());
  const date = getLatestGitCommitDate();
  assertEquals(date.getTime(), expected * 1000);
});

Deno.test("falls back to the current date outside a repository", async () => {
  const dir = await Deno.makeTempDir();
  try {
    const before = Date.now();
    const date = getLatestGitCommitDate(dir);
    const after = Date.now();
    assert(
      date.getTime() >= before && date.getTime() <= after,
      "fallback date must be approximately now",
    );
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
