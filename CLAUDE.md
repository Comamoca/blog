# Claude Code Spec-Driven Development

Kiro-style Spec Driven Development implementation using claude code slash
commands, hooks and agents.

## Project Context

### Paths

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual
features

### Active Specifications

- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

#### Current Specifications

- `typescript-clojure-intro` -
  TypeScriptユーザーに贈るClojure入門という記事を書く (Phase: initialized)
- `linkcard-fix` - リンクカードが表示されていない問題の修正 (Phase:
  implementation-completed)
- `worker-ogp` - OGP画像生成をCloudflare Workersへ移行 (Phase:
  implementation-in-progress)
- `ox-content-migration` - SSG基盤をLumeからox-contentへ移行し、URL互換性を
  維持したままプレビュー反映を高速化する (Phase: implementation-completed。
  Cloudflare Pagesへのデモデプロイと実機確認まで完了。mainへのマージ待ち)

## Development Guidelines

- Think in English, but generate responses in Japanese
  (思考は英語、回答の生成は日本語で行うように)

## Workflow

### Phase 0: Steering (Optional)

`/kiro:steering` - Create/update steering documents `/kiro:steering-custom` -
Create custom steering for specialized contexts

Note: Optional for new features or small additions. You can proceed directly to
spec-init.

### Phase 1: Specification Creation

1. `/kiro:spec-init [detailed description]` - Initialize spec with detailed
   project description
2. `/kiro:spec-requirements [feature]` - Generate requirements document
3. `/kiro:spec-design [feature]` - Interactive: "Have you reviewed
   requirements.md? [y/N]"
4. `/kiro:spec-tasks [feature]` - Interactive: Confirms both requirements and
   design review

### Phase 2: Progress Tracking

`/kiro:spec-status [feature]` - Check current progress and phases

## Development Rules

1. **Consider steering**: Run `/kiro:steering` before major development
   (optional for new features)
2. **Follow 3-phase approval workflow**: Requirements → Design → Tasks →
   Implementation
3. **Approval required**: Each phase requires human review (interactive prompt
   or manual)
4. **No skipping phases**: Design requires approved requirements; Tasks require
   approved design
5. **Update task status**: Mark tasks as completed when working on them
6. **Keep steering current**: Run `/kiro:steering` after significant changes
7. **Check spec compliance**: Use `/kiro:spec-status` to verify alignment

## Steering Configuration

### Current Steering Files

Managed by `/kiro:steering` command. Updates here reflect command changes.

### Active Steering Files

- `product.md`: Always included - Product context and business objectives
- `tech.md`: Always included - Technology stack and architectural decisions
- `structure.md`: Always included - File organization and code patterns

### Custom Steering Files

<!-- Added by /kiro:steering-custom command -->
<!-- Format:
- `filename.md`: Mode - Pattern(s) - Description
  Mode: Always|Conditional|Manual
  Pattern: File patterns for Conditional mode
-->

### Inclusion Modes

- **Always**: Loaded in every interaction (default)
- **Conditional**: Loaded for specific file patterns (e.g., "*.test.js")
- **Manual**: Reference with `@filename.md` syntax

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a personal blog built with
[ox-content](https://github.com/ubugeeei-prod/ox-content) (Rust-core SSG, driven
via a Vite custom-host), using TailwindCSS, DaisyUI, and TypeScript. The blog
supports bilingual content (Japanese/English) and includes RSS feeds, OG image
generation (delegated to a separate Cloudflare Worker, `og/`), and
Pagefind-based client-side search.

The site was migrated from Lume (a Deno SSG) to ox-content; see
`.kiro/specs/ox-content-migration/design.md` for the full rationale and
`pre-lume-removal` git tag for the last commit with the old Lume pipeline still
intact (restorable via `git checkout pre-lume-removal -- <path>` or
`git diff pre-lume-removal HEAD` to review what changed).

## Development Commands

### Core Development

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Deploy to Cloudflare Pages
npx vite build
wrangler pages deploy ./dist --project-name=blog

# Download fonts (used by the OG Worker's font-subsetting pipeline)
deno task download-fonts

# Run tests
deno task test
```

### Alternative Tools

```bash
# Open blog posts for editing (requires `nu` shell and `fzf`)
just open

# Create new diary entry
just diary

# Create new blog post
just new

# Edit existing diary entries
just edit-diary

# Open latest diary entry
just latest-diary
```

## Architecture

### Project Structure

```
src/
├── _components/          # Reusable components (TSX, synchronous)
│   ├── Header.tsx       # Main site header with navigation
│   ├── PostList.tsx     # Blog post listing component
│   ├── PostCard.tsx     # Individual post preview card
│   ├── Search.tsx       # Pagefind search modal shell
│   ├── Footer.tsx       # Footer component
│   ├── Logo.tsx         # Site logo
│   └── Twemoji.tsx      # Twemoji component
├── _includes/layouts/   # main.tsx / post.tsx
├── blog/                # Blog post markdown files
├── img/                 # Image assets
├── public/              # favicon.svg, icon.png (served at site root)
├── well-known/          # .well-known directory content
├── consts.ts            # Site constants
└── style.css            # Tailwind v4 entry

ssg/                     # ox-content build logic (ported from plugins/)
├── markdown.ts           # remark/rehype/HTML-postprocess plugin wiring
├── linkcard.ts            # External link card generation
├── fetchogp.ts             # OGP metadata fetching (linkedom-based)
├── og_metas.ts              # og.comamoca.dev image URL generation
├── feed.ts                   # RSS/JSON Feed, git-history-based dates
├── static-assets.ts           # Serves img/public/well-known
├── pagefind.ts                 # Indexes dist/ HTML via Pagefind's Node API
├── pagefind-client.ts           # PagefindUI init script (main.tsx/post.tsx)
├── run-pagefind.ts                # Entry point run after `vite build`
└── pages/                          # All/Tech/Diary/Me/Info/Hub/NotFound

host.ts                 # All route definitions (custom-host)
vite.config.ts           # Vite + ox-content custom-host config

scripts/
└── downloadFonts.ts     # Font download for the OG Worker's font subsetting

create.rb                # Blog post creation script
```

### Key Technologies

- **Framework**: ox-content (Rust core) + Vite custom-host
- **Styling**: TailwindCSS v4 + DaisyUI v5
- **Components**: TSX with `@ox-content/vite-plugin`'s bundled synchronous JSX
  runtime (`renderToString`). Not React/Preact.
- **Deployment**: Cloudflare Pages
- **Fonts**: Noto Sans CJK for Japanese support
- **Syntax highlighting**: Shiki (catppuccin-mocha theme)

### Routing

There is no `*.page.tsx` file-naming convention. All routes (articles, listing
pages, static pages, feeds, sitemap, 404) are defined programmatically in
`host.ts`'s `routes()`. To add a URL, add a route there. URL compatibility with
the pre-migration site is enforced by `tests/url_compat_test.ts` against
`tests/fixtures/urls.txt`.

### Component Architecture

Components are plain synchronous functions, imported directly (no
`comp.Header`-style injection):

```tsx
export default function MyComponent() {
  // Component logic
}
```

Do not mark components `async` — the JSX runtime's `renderToString` is
synchronous, so an async component's Promise is silently discarded and it
renders as an empty string. Any async work (fetching data, reading files)
belongs in `host.ts`'s route `render()`, with the resolved data passed to the
component as props.

### Content Management

- Blog posts: Markdown files in `src/blog/` with frontmatter
- Diary entries: Special posts with `-diary.md` suffix
- Image assets: Stored in `src/img/` and served as-is (no build-time
  optimization/resizing)

## Configuration Files

### Primary Config

- `vite.config.ts`: Vite + `oxContentCustomHost` configuration
- `host.ts`: Route definitions
- `package.json`: npm scripts and dependencies
- `deno.jsonc`: Deno config for running tests (`deno task test`) and the
  `date-fns` import used by `tests/diary.test.ts`

## Custom Features

### Content Generation

- `create.rb`: Ruby script for generating new blog posts and diary entries
- Automatic frontmatter generation with timestamps
- Support for both regular posts and daily diary entries

### Font Handling

- `scripts/downloadFonts.ts` downloads the Noto Sans CJK corpus consumed by the
  OG Worker's (`og/`) font-subsetting pipeline. Unrelated to the blog's own
  build, which does not generate images at build time.

### Search Functionality

Pagefind, continued from the pre-migration Lume setup (ox-content's own built-in
BM25 search was evaluated and rejected — see
`.kiro/specs/ox-content-migration/design.md` for the comparison). Unlike the
rest of the build, this runs as a **separate step after** `vite build`, not as a
Vite plugin hook:

- `ssg/pagefind.ts` walks `dist/**/*.html` and builds the index via Pagefind's
  Node API (`createIndex` → `addHTMLFile` → `writeFiles`)
- `ssg/run-pagefind.ts` is the entry point; `package.json`'s `build` script
  chains it after `vite build` (`vite build && node ... run-pagefind.ts`). A
  `closeBundle` Vite plugin hook was tried first but fired _before_
  `oxContentCustomHost`'s own output-writing hook, so plugin-array ordering
  can't be relied on here — a shell `&&` guarantees the order instead
- `ssg/pagefind-client.ts` holds the `PagefindUI` init script, shared by
  `main.tsx` and `post.tsx`. It must be inserted via `raw()`, not as a plain JSX
  text child — the JSX runtime HTML-escapes text children even inside
  `<script>`, which silently breaks the embedded JS (`"` becomes `&quot;`)
- Only runs in production builds; `dev` has no search index, matching the
  dev-speed tradeoff documented for the other whole-site plugins

### Link Cards

- External link preview generation via `ssg/linkcard.ts` (remark plugin, Node
  port of the original Deno implementation)
- Can be disabled with the `DISABLE_LINKCARD` environment variable

## Development Notes

### File Naming Conventions

- Components: PascalCase TSX files in `src/_components/` or `ssg/pages/`
- Blog posts: `YYYY-MM-DD-title.md` format
- Diary entries: `YYYY-MM-DD-diary.md` format

### Content Guidelines

- Use Japanese as primary language with English support
- Include proper frontmatter in all markdown files
- Images are stored in `src/img/` and referenced as-is (no build-time
  optimization/resizing)

### dev server の依存関係宣言

`host.ts` の各ルートには `dependencies` を宣言する必要がある。宣言が無いと
devサーバーが応答をキャッシュし続け、ファイルを編集しても反映されない
(エラーは出ない)。

## Deployment

The site deploys to Cloudflare Pages via `.github/workflows/deploy.yaml` on push
to `main`. The build process:

1. `npx vite build` — builds the static site to `dist/`
2. `wrangler pages deploy ./dist` — deploys to `comamoca.dev`

The OG Worker (`og/`) deploys separately, only when its own inputs (`og/**`,
`src/blog/**`, `flake.nix`, `flake.lock`) change.
