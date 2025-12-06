# Claude Code Spec-Driven Development

Kiro-style Spec Driven Development implementation using claude code slash commands, hooks and agents.

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

#### Current Specifications
- `typescript-clojure-intro` - TypeScriptユーザーに贈るClojure入門という記事を書く (Phase: initialized)
- `linkcard-fix` - リンクカードが表示されていない問題の修正 (Phase: initialized)

## Development Guidelines
- Think in English, but generate responses in Japanese (思考は英語、回答の生成は日本語で行うように)

## Workflow

### Phase 0: Steering (Optional)
`/kiro:steering` - Create/update steering documents
`/kiro:steering-custom` - Create custom steering for specialized contexts

Note: Optional for new features or small additions. You can proceed directly to spec-init.

### Phase 1: Specification Creation
1. `/kiro:spec-init [detailed description]` - Initialize spec with detailed project description
2. `/kiro:spec-requirements [feature]` - Generate requirements document
3. `/kiro:spec-design [feature]` - Interactive: "Have you reviewed requirements.md? [y/N]"
4. `/kiro:spec-tasks [feature]` - Interactive: Confirms both requirements and design review

### Phase 2: Progress Tracking
`/kiro:spec-status [feature]` - Check current progress and phases

## Development Rules
1. **Consider steering**: Run `/kiro:steering` before major development (optional for new features)
2. **Follow 3-phase approval workflow**: Requirements → Design → Tasks → Implementation
3. **Approval required**: Each phase requires human review (interactive prompt or manual)
4. **No skipping phases**: Design requires approved requirements; Tasks require approved design
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

This is a personal blog built with Lume (Deno static site generator), using
TailwindCSS, DaisyUI, and TypeScript. The blog supports bilingual content
(Japanese/English) and includes features like search, RSS feeds, and automated
font loading.

## Development Commands

### Core Development

```bash
# Development server with hot reload
deno task serve

# Production build
deno task build

# Build for Cloudflare Pages deployment
deno task deploy

# Download required fonts for OG image generation
deno task download-fonts
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
├── _components/          # Reusable React components (TSX)
│   ├── Header.tsx       # Main site header with navigation
│   ├── PostList.tsx     # Blog post listing component
│   ├── PostCard.tsx     # Individual post preview card
│   └── Search.tsx       # Site search functionality
├── _includes/           # Layout templates
│   └── layouts/        # Page layout templates
├── blog/               # Blog post markdown files
├── img/                # Image assets
└── *.page.tsx          # Page components (index, 404, etc.)

plugins/
├── lume/               # Custom Lume plugins
└── linkcard.ts         # External link card generation

_config.ts              # Main Lume configuration
```

### Key Technologies

- **Framework**: Lume v3 (Deno static site generator)
- **Styling**: TailwindCSS v4 + DaisyUI v5
- **Components**: React TSX with SSX runtime
- **Deployment**: Cloudflare Pages
- **Fonts**: Noto Sans CJK for Japanese support

### Component Architecture

All components in `src/_components/` are **async functions** due to Lume v3
migration requirements. When creating new components:

```tsx
export default async function MyComponent() {
  // Component logic
}
```

### Content Management

- Blog posts: Markdown files in `src/blog/` with frontmatter
- Diary entries: Special posts with `-diary.md` suffix
- Image assets: Stored in `src/img/` and auto-optimized in production

## Configuration Files

### Primary Config

- `_config.ts`: Main Lume configuration with plugins and build settings
- `deno.jsonc`: Deno configuration with tasks and imports
- `tailwind.config.js`: TailwindCSS configuration

### Environment-Specific Behavior

The `RELEASE` environment variable controls production features:

- When `RELEASE=1`: Enables minification, compression, SEO plugins, OG image
  generation
- Development: Simplified build with faster reload times

## Custom Features

### Content Generation

- `create.rb`: Ruby script for generating new blog posts and diary entries
- Automatic frontmatter generation with timestamps
- Support for both regular posts and daily diary entries

### Font Handling

- Custom font loading script: `scripts/downloadFonts.ts`
- Supports Japanese typography with Noto fonts
- Required for OG image generation in production

### Search Functionality

- Uses Pagefind for client-side search
- Automatically indexes all content during production builds
- Search component in `src/_components/Search.tsx`

## Development Notes

### File Naming Conventions

- Page files: `*.page.tsx` (e.g., `index.page.tsx`, `404.page.tsx`)
- Components: PascalCase TSX files in `src/_components/`
- Blog posts: `YYYY-MM-DD-title.md` format
- Diary entries: `YYYY-MM-DD-diary.md` format

### Content Guidelines

- Use Japanese as primary language with English support
- Include proper frontmatter in all markdown files
- Images should be optimized and stored in `src/img/`

### Plugin System

Custom plugins are located in `plugins/` directory:

- `linkcard.ts`: Generates preview cards for external links
- `plugins/lume/footnote.ts`: Custom footnote processing

## Deployment

The site is automatically deployed to Cloudflare Pages. The build process:

1. Downloads required fonts for OG image generation
2. Builds the site with production optimizations
3. Deploys to `comamoca.dev` domain

Production builds include additional optimizations:

- HTML/CSS minification
- Brotli and Gzip compression
- Automatic sitemap and RSS feed generation
- Image optimization and responsive picture generation
