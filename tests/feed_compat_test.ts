import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import { join } from "jsr:@std/path";

/**
 * ox-content移行のフィード互換性回帰テスト。
 *
 * tests/fixtures/feed.xml / feed.json は移行前 (Lume) のビルド出力。
 * 比較対象は title / link / pubDate (RSS) と id / title / date_published
 * (JSON Feed) に限定する。content:encoded / content_html の本文形式は
 * design.md の設計決定ログのとおり別途方針を決めるため対象外。
 *
 * 出力先は BUILD_OUTPUT_DIR 環境変数で切り替える (デフォルト: _site)。
 *
 * スナップショット取得後に追加された記事があると、現在のフィードの先頭は
 * スナップショットより進む (10件上限なので古い順に押し出される)。そのため
 * 件数の完全一致ではなく、スナップショット先頭の記事で位置を合わせ、
 * 両者に残っている範囲だけを比較する。
 */

const OUTPUT_DIR = Deno.env.get("BUILD_OUTPUT_DIR") ?? "_site";

async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

type RssItem = { title: string; link: string; pubDate: string };

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const body = m[1];
    const title = body.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "";
    const link = body.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const pubDate = body.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ??
      "";
    items.push({ title, link, pubDate });
  }
  return items;
}

const readyForXml = await fileExists(join(OUTPUT_DIR, "api", "feed.xml"));

Deno.test({
  name: "フィード互換性: RSS item の title/link/pubDate が移行前と一致する",
  ignore: !readyForXml,
  fn: async () => {
    const expected = parseRssItems(
      await Deno.readTextFile(join("tests", "fixtures", "feed.xml")),
    );
    const actual = parseRssItems(
      await Deno.readTextFile(join(OUTPUT_DIR, "api", "feed.xml")),
    );

    assertEquals(actual.length, expected.length, "item件数が一致しない");

    const offset = actual.findIndex((a) => a.link === expected[0].link);
    assert(
      offset >= 0,
      `スナップショット先頭 (${expected[0].link}) が現在のフィードに無い`,
    );

    for (let i = 0; i + offset < actual.length; i++) {
      assertEquals(
        actual[i + offset],
        expected[i],
        `item[${i}] (${expected[i].title}) が一致しない`,
      );
    }
  },
});

const readyForJson = await fileExists(join(OUTPUT_DIR, "api", "feed.json"));

Deno.test({
  name:
    "フィード互換性: JSON Feed の id/title/date_published が移行前と一致する",
  ignore: !readyForJson,
  fn: async () => {
    const expected = JSON.parse(
      await Deno.readTextFile(join("tests", "fixtures", "feed.json")),
    );
    const actual = JSON.parse(
      await Deno.readTextFile(join(OUTPUT_DIR, "api", "feed.json")),
    );

    assertEquals(
      actual.items.length,
      expected.items.length,
      "item件数が一致しない",
    );

    const offset = actual.items.findIndex((a: { id: string }) =>
      a.id === expected.items[0].id
    );
    assert(
      offset >= 0,
      `スナップショット先頭 (${expected.items[0].id}) が現在のフィードに無い`,
    );

    for (let i = 0; i + offset < actual.items.length; i++) {
      const e = expected.items[i];
      const a = actual.items[i + offset];
      assertEquals(
        { id: a.id, title: a.title, date_published: a.date_published },
        { id: e.id, title: e.title, date_published: e.date_published },
        `items[${i}] (${e.title}) が一致しない`,
      );
    }
  },
});
