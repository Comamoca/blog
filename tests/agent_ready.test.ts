import { test } from "vite-plus/test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { assert, assertEquals } from "./_asserts.ts";
import { markdownUrlFor } from "../ssg/markdown-path.ts";

const OUTPUT_DIR = process.env.BUILD_OUTPUT_DIR ?? "dist";
const outputReady = existsSync(OUTPUT_DIR) && statSync(OUTPUT_DIR).isDirectory();
const t = outputReady ? test : test.skip;

test("markdownUrlFor: ページURLをMarkdown版のURLへ対応づける", () => {
  assertEquals(markdownUrlFor("https://comamoca.dev/"), "https://comamoca.dev/index.md");
  assertEquals(
    markdownUrlFor("https://comamoca.dev/blog/a/"),
    "https://comamoca.dev/blog/a/index.md",
  );
  assertEquals(markdownUrlFor("https://comamoca.dev/me.html"), "https://comamoca.dev/me.md");
});

test("agent-skills index: digest が SKILL.md の実体と一致する", () => {
  const index = JSON.parse(readFileSync("src/well-known/agent-skills/index.json", "utf-8"));
  assert(index.skills.length > 0);
  for (const skill of index.skills) {
    const body = readFileSync(`src/public${skill.url}`);
    assertEquals(skill.digest, `sha256:${createHash("sha256").update(body).digest("hex")}`);
  }
});

test("robots.txt: AI向けルール・Content-Signal・Sitemap を宣言している", () => {
  const robots = readFileSync("src/public/robots.txt", "utf-8");
  assert(/^User-agent:\s*\*/m.test(robots));
  assert(/^Content-Signal:/m.test(robots));
  for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "GPTBot", "ClaudeBot"]) {
    assert(new RegExp(`^User-agent:\\s*${bot}$`, "m").test(robots), bot);
  }
  assert(/^Sitemap:\s*https:\/\/comamoca\.dev\/sitemap\.xml/m.test(robots));
});

test("api-catalog: RFC 9727 の linkset として妥当", () => {
  const catalog = JSON.parse(readFileSync("src/well-known/api-catalog", "utf-8"));
  assert(Array.isArray(catalog.linkset));
  assert(catalog.linkset[0].item.length > 0);
});

test("openapi.json: OpenAPI 3.1として妥当で、実在するエンドポイントを記述している", () => {
  const spec = JSON.parse(readFileSync("src/public/openapi.json", "utf-8"));
  assert(spec.openapi.startsWith("3."));
  assert(typeof spec.info.title === "string" && spec.info.title.length > 0);
  assert(
    typeof spec.externalDocs?.url === "string",
    "externalDocs.url (人間向けドキュメント) が無い",
  );
  for (const path of ["/api/feed.xml", "/api/feed.json", "/sitemap.xml", "/sitemap.md"]) {
    assert(spec.paths[path]?.get, `paths["${path}"].get が無い`);
  }
});

t("/mcp.html: タイトル・見出しに製品名とAPIを含み、OpenAPI/llms.txtへリンクしている", () => {
  const html = readFileSync(`${OUTPUT_DIR}/mcp.html`, "utf-8");
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
  const h1 = /<h1[^>]*>([^<]*)<\/h1>/.exec(html)?.[1] ?? "";
  assert(title.includes("API"), `<title>に"API"が無い: ${title}`);
  assert(h1.includes("API"), `<h1>に"API"が無い: ${h1}`);
  assert(html.includes("/openapi.json"), "/openapi.jsonへのリンクが無い");
  assert(html.includes("/llms.txt") || html.includes("/llms-full.txt"), "llms.txtへのリンクが無い");
});

t("homepage: /mcp.html へのリンクがある (ドキュメントのホームページからの到達性)", () => {
  const html = readFileSync(`${OUTPUT_DIR}/index.html`, "utf-8");
  assert(html.includes('href="/mcp.html"'), "ホームページから/mcp.htmlへのリンクが無い");
});
