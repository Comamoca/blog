// Combines the publication date derived from the filename with the time of
// the first git commit that added the file.
//
// Why not use commit dates directly? The git history of this repo contains
// large bulk imports (e.g. posts published in March are committed in June),
// so commit dates do not reflect actual publication dates. Using them as
// the post date makes old posts look "new" again, which floods RSS readers.
//
// Why not use the filename date alone? Filename dates are midnights, so
// when several posts are published on the same day they all share the same
// timestamp and RSS readers only deliver the first one as "new".
//
// The filename date provides the stable day, the first-commit time provides
// a distinct time-of-day per post without ever moving the post to a
// different day.
import { merge } from "lume/core/utils/object.ts";
import type Site from "lume/core/site.ts";
import { getFileFirstCommitDate } from "../git_commit_date.ts";

export interface Options {
  /** The variable name used to save the value */
  varName?: string;
}

export const defaults = {
  varName: "date",
} satisfies Options;

export function gitDate(userOptions?: Options) {
  const options = merge(defaults, userOptions);
  const { varName } = options;

  return (site: Site) => {
    site.preprocess((pages) => {
      for (const page of pages) {
        const sourcePath = site.src(page.sourcePath);
        const firstCommit = getFileFirstCommitDate(sourcePath);

        if (!firstCommit) {
          continue;
        }

        // Only replace the time-of-day: keep the day from the filename.
        const existingDate = page.data[varName];
        const existing = existingDate instanceof Date
          ? existingDate
          : new Date(existingDate);

        if (Number.isNaN(existing.getTime())) {
          continue;
        }

        const combined = new Date(existing);
        combined.setUTCHours(
          firstCommit.getUTCHours(),
          firstCommit.getUTCMinutes(),
          firstCommit.getUTCSeconds(),
        );
        page.data[varName] = combined;
      }
    });
  };
}

export default gitDate;
