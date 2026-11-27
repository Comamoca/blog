# agents.md — comamoca.dev

Guidance for AI agents browsing or working with this site.

## About this site

Personal blog by Comamoca, mostly in Japanese, covering programming
(NixOS, Emacs, Gleam, and more) and daily diary entries. See
[llms.txt](https://comamoca.dev/llms.txt) / [llms-full.txt](https://comamoca.dev/llms-full.txt)
for the full content index and navigation.

## How to read a page

- Every page has a Markdown counterpart: either follow the
  `<link rel="alternate" type="text/markdown">` tag, or request the page with
  `Accept: text/markdown` and the same URL is content-negotiated to Markdown.
- Pages carry `WebSite`/`Person` or `BlogPosting` JSON-LD (schema.org).
- [sitemap.md](https://comamoca.dev/sitemap.md) lists every article with its
  title and description; [sitemap.xml](https://comamoca.dev/sitemap.xml) is the
  URL-only XML equivalent.
- Site search is available via Pagefind, or the WebMCP tool `search_blog`
  registered on each page.

## Working with the source code

This site's source is public at https://github.com/Comamoca/blog. Coding
agents working in that repository should read `AGENTS.md` at the repo root
(or `CLAUDE.md` for the Claude Code / Kiro spec-driven workflow), not this
file — this one is about reading the published site, not developing it.

## Content policy

Per [robots.txt](https://comamoca.dev/robots.txt)'s
[Content Signals](https://contentsignals.org/): search and AI-answer citation
are allowed; AI training use is not (`ai-train=no`).
