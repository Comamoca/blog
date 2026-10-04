import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import {
  combineDate,
  firstCommitTimes,
  latestArticleCommitDate,
} from "../ssg/feed.ts";

/**
 * ox-content移行版フィード日付ロジックの単体テスト。
 *
 * 旧 tests/rss_feed.test.ts は `deno task lume` でサイト全体を再ビルドして
 * 生成済みfeed.xmlを検証する統合テストだったが、layoutsがstyle.cssを
 * importするようになりLumeの生ビルドが通らなくなったため廃止した
 * (Lume自体がox-content移行で置き換えられる対象であるため)。
 *
 * 検証していた性質 (lastBuildDateが最新コミット時刻と一致する / pubDateが
 * 時刻成分を持つ / pubDateの日付がURLの日付と一致する) は、ここでは
 * ssg/feed.ts の純粋関数に対して直接検証する。tests/feed_compat_test.ts は
 * 移行前のフィードとの出力一致 (スナップショット比較) を担当するため、
 * この2つで役割が分かれる。
 */

const REPO_ROOT = new URL("..", import.meta.url).pathname;

Deno.test("latestArticleCommitDate は記事を追加した最新コミット時刻と一致する", async () => {
  const cmd = new Deno.Command("git", {
    args: ["log", "--diff-filter=A", "-1", "--format=%ct", "--", "src/blog"],
    cwd: REPO_ROOT,
    stdout: "piped",
  });
  const { stdout } = await cmd.output();
  const expected = parseInt(new TextDecoder().decode(stdout).trim(), 10);

  const actual = latestArticleCommitDate(REPO_ROOT);
  assertEquals(Math.floor(actual.getTime() / 1000), expected);
});

Deno.test("combineDate: コミット時刻がある場合、時刻成分がUTC深夜以外になる", () => {
  const fileDate = new Date("2026-09-11T00:00:00Z");
  const commitMs = Date.UTC(2026, 8, 11, 5, 59, 1); // 05:59:01 UTC
  const combined = combineDate(fileDate, commitMs);

  assert(
    combined.getUTCHours() !== 0 || combined.getUTCMinutes() !== 0 ||
      combined.getUTCSeconds() !== 0,
    "コミット時刻を合成した日付はUTC深夜であってはならない",
  );
});

Deno.test("combineDate: 日付部分はfileDateのまま変わらない (時刻のみ合成)", () => {
  const fileDate = new Date("2026-09-11T00:00:00Z");
  const commitMs = Date.UTC(2099, 0, 1, 12, 0, 0); // 年月日が大きく異なるコミット時刻
  const combined = combineDate(fileDate, commitMs);

  assertEquals(combined.getUTCFullYear(), 2026);
  assertEquals(combined.getUTCMonth(), 8); // 0-indexed = 9月
  assertEquals(combined.getUTCDate(), 11);
});

Deno.test("combineDate: コミット時刻が無い場合はfileDateをそのまま返す", () => {
  const fileDate = new Date("2026-09-11T00:00:00Z");
  const combined = combineDate(fileDate, undefined);
  assertEquals(combined.getTime(), fileDate.getTime());
});

Deno.test("latestArticleCommitDate: リポジトリ外では現在時刻にフォールバックする", () => {
  const dir = Deno.makeTempDirSync();
  try {
    const before = Date.now();
    const date = latestArticleCommitDate(dir);
    const after = Date.now();
    assert(
      date.getTime() >= before && date.getTime() <= after,
      "フォールバック日時はおおよそ現在時刻であること",
    );
  } finally {
    Deno.removeSync(dir, { recursive: true });
  }
});

Deno.test("firstCommitTimes: リポジトリ外では空のMapを返す (例外を投げない)", () => {
  const dir = Deno.makeTempDirSync();
  try {
    const times = firstCommitTimes(dir, "src/blog");
    assertEquals(times.size, 0);
  } finally {
    Deno.removeSync(dir, { recursive: true });
  }
});

Deno.test("firstCommitTimes: src/blog配下の実ファイルに対して時刻が引ける", () => {
  const times = firstCommitTimes(REPO_ROOT, "src/blog");
  assert(times.size > 0, "1件以上のコミット時刻が取得できること");
  for (const [, ts] of times) {
    assert(
      Number.isFinite(ts) && ts > 0,
      "取得した時刻は有効なUNIX時刻(ms)であること",
    );
  }
});
