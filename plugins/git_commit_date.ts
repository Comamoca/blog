/**
 * Builds the environment for a git subprocess rooted at `cwd`.
 *
 * `Deno.Command` merges `env` into the parent environment and cannot unset
 * variables, so an inherited GIT_DIR (git exports it as an absolute path
 * inside hook processes) would make `git log` succeed even when `cwd` points
 * outside a repository. Overriding GIT_DIR/GIT_WORK_TREE with values derived
 * from the explicit `cwd` keeps that argument authoritative: inside a
 * repository it resolves as usual, elsewhere git fails and callers fall back.
 */
function gitCommandEnv(cwd: string): Record<string, string> {
  let root = cwd;
  try {
    root = Deno.realPathSync(cwd);
  } catch {
    // Unresolvable cwd — leave it as-is and let git fail gracefully.
  }
  return {
    GIT_DIR: `${root}/.git`,
    GIT_WORK_TREE: root,
  };
}

/**
 * Returns the timestamp of the first commit that added a given file.
 * Used to fill in the time-of-day component of a post's published date,
 * so multiple posts published on the same day still get distinct times
 * and each one is picked up as "new" by RSS readers.
 *
 * The date itself always comes from the filename (or front matter), never
 * from git: the repository history has been rewritten/imported, so commit
 * dates are not a reliable source for publication dates.
 *
 * Returns null when the file is not tracked by git (e.g. newly added and
 * not yet committed), so the caller can fall back to the filename date.
 */
export function getFileFirstCommitDate(
  filePath: string,
  cwd: string = Deno.cwd(),
): Date | null {
  try {
    const command = new Deno.Command("git", {
      args: ["log", "--diff-filter=A", "-1", "--format=%ct", "--", filePath],
      cwd,
      env: gitCommandEnv(cwd),
      stdout: "piped",
      stderr: "piped",
    });
    const { stdout, success } = command.outputSync();
    if (!success) {
      return null;
    }
    const timestamp = parseInt(new TextDecoder().decode(stdout).trim(), 10);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp * 1000);
  } catch {
    // git binary missing or cwd invalid — degrade gracefully.
    return null;
  }
}

/**
 * Returns the timestamp of the latest commit that *added* a file under
 * `paths` (the article directory by default), for use as the RSS feed's
 * <lastBuildDate>.
 *
 * Why not the latest commit of the whole repository? <lastBuildDate> would
 * then move on every commit — a typo fix in an existing post, a CI tweak, a
 * dependency bump — which makes the feed look like it changed when no new
 * article was published. `--diff-filter=A` keeps only commits that introduce
 * a new file, so editing an existing post leaves the date untouched. Renames
 * are reported as `R` (git detects them by default) and are ignored too.
 *
 * Falls back to the current date when git is unavailable or fails, so the
 * build always succeeds (e.g. git-less CI sandboxes).
 */
export function getLatestArticleCommitDate(
  cwd: string = Deno.cwd(),
  paths: string[] = ["src/blog"],
): Date {
  try {
    const command = new Deno.Command("git", {
      args: ["log", "--diff-filter=A", "-1", "--format=%ct", "--", ...paths],
      cwd,
      env: gitCommandEnv(cwd),
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
