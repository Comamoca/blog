/**
 * Returns the timestamp of the latest git commit, for use as the RSS feed's
 * <lastBuildDate>. Changes only when the repository changes, so readers are
 * notified of new posts without being re-flooded on every build.
 *
 * Falls back to the current date when git is unavailable or fails, so the
 * build always succeeds (e.g. git-less CI sandboxes).
 */
export function getLatestGitCommitDate(cwd: string = Deno.cwd()): Date {
  try {
    const command = new Deno.Command("git", {
      args: ["log", "-1", "--format=%ct"],
      cwd,
      stdout: "piped",
      stderr: "piped",
    });
    const { stdout, success } = command.outputSync();
    if (!success) {
      return new Date();
    }
    const timestamp = parseInt(new TextDecoder().decode(stdout).trim(), 10);
    if (Number.isNaN(timestamp)) {
      return new Date();
    }
    return new Date(timestamp * 1000);
  } catch {
    // git binary missing or cwd invalid — degrade gracefully.
    return new Date();
  }
}
