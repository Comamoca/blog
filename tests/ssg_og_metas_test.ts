import { test } from "vite-plus/test";
import { assertEquals } from "./_asserts.ts";
import { buildOgImageUrl, MAX_DESCRIPTION_LENGTH, truncateDescription } from "../ssg/og_metas.ts";

test("buildOgImageUrl: post layout with title and description", () => {
  const url = buildOgImageUrl("post", "タイトル", "説明文");
  assertEquals(
    url,
    "https://og.comamoca.dev/og.png?l=post&t=%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB&d=%E8%AA%AC%E6%98%8E%E6%96%87",
  );
});

test("buildOgImageUrl: main layout without description omits d param", () => {
  const url = buildOgImageUrl("main", "かわいい駆動生活。");
  assertEquals(
    url,
    "https://og.comamoca.dev/og.png?l=main&t=%E3%81%8B%E3%82%8F%E3%81%84%E3%81%84%E9%A7%86%E5%8B%95%E7%94%9F%E6%B4%BB%E3%80%82",
  );
});

test("buildOgImageUrl: empty description omits d param", () => {
  const url = buildOgImageUrl("post", "タイトル", "");
  assertEquals(url, "https://og.comamoca.dev/og.png?l=post&t=%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB");
});

test("buildOgImageUrl: percent-encodes special characters", () => {
  const url = buildOgImageUrl("post", "a&b=c d", undefined);
  assertEquals(url, "https://og.comamoca.dev/og.png?l=post&t=a%26b%3Dc%20d");
});

test("buildOgImageUrl: is deterministic for the same input", () => {
  assertEquals(buildOgImageUrl("post", "同じ", "内容"), buildOgImageUrl("post", "同じ", "内容"));
});

test("truncateDescription: keeps text within the limit", () => {
  assertEquals(truncateDescription("短い文"), "短い文");
});

test("truncateDescription: truncates to 80 chars with ellipsis", () => {
  const long = "あ".repeat(MAX_DESCRIPTION_LENGTH + 10);
  const truncated = truncateDescription(long);
  assertEquals(truncated.length, MAX_DESCRIPTION_LENGTH + 1);
  assertEquals(truncated.endsWith("…"), true);
  assertEquals(truncated.slice(0, MAX_DESCRIPTION_LENGTH), "あ".repeat(MAX_DESCRIPTION_LENGTH));
});

test("truncateDescription: keeps exactly 80-char text unchanged", () => {
  const exact = "い".repeat(MAX_DESCRIPTION_LENGTH);
  assertEquals(truncateDescription(exact), exact);
});
