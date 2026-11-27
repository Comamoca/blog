import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { negotiateNotFound } from "../ssg/not-found-negotiation.ts";

test("negotiateNotFound: Accept: text/markdown はMarkdownの404本文を返す", () => {
  const result = negotiateNotFound("text/markdown", "/no-such-page");
  assert(result !== null);
  assertEquals(result!.status, 404);
  assertEquals(result!.headers["content-type"], "text/markdown; charset=utf-8");
  assertEquals(result!.headers["vary"], "Accept");
  assert(result!.body.length >= 20, "本文は20文字以上であること");
  assert(result!.body.includes("/no-such-page"));
  assert(/https:\/\/comamoca\.dev\/(sitemap\.md|llms\.txt)/.test(result!.body));
});

test("negotiateNotFound: Accept: application/json はJSONエラーを返す", () => {
  const result = negotiateNotFound("application/json", "/no-such-page");
  assert(result !== null);
  assertEquals(result!.status, 404);
  assertEquals(result!.headers["content-type"], "application/json; charset=utf-8");
  const parsed = JSON.parse(result!.body);
  assertEquals(parsed.error.code, "not_found");
  assertEquals(parsed.error.status, 404);
  assert(typeof parsed.error.message === "string" && parsed.error.message.length > 0);
  assert(typeof parsed.error.resolution === "string" && parsed.error.resolution.length > 0);
});

test("negotiateNotFound: /api/* はAcceptが無くてもJSONを既定にする", () => {
  const result = negotiateNotFound(null, "/api/does-not-exist");
  assert(result !== null);
  assertEquals(result!.headers["content-type"], "application/json; charset=utf-8");
});

test("negotiateNotFound: 通常ページでAccept指定が無ければnull (既定のHTML 404を素通りさせる)", () => {
  assertEquals(negotiateNotFound(null, "/no-such-page"), null);
  assertEquals(negotiateNotFound("text/html", "/no-such-page"), null);
});

test("negotiateNotFound: application/json を優先する (markdownとjsonが両方Acceptにある場合)", () => {
  const result = negotiateNotFound("text/markdown, application/json;q=0.9", "/x");
  assert(result !== null);
  assertEquals(result!.headers["content-type"], "application/json; charset=utf-8");
});
