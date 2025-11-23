# Technology Stack

## Architecture
**Static Site Generator Architecture**: Lume v3-based static site generation with React component integration, deployed to Cloudflare Pages CDN for global distribution.

## Frontend Technologies
- **Static Site Generator**: Lume v3 (Deno-based)
- **Component Framework**: React with TSX components using SSX runtime
- **Styling**: TailwindCSS v4 + DaisyUI v5 for component library
- **Typography**: Noto Sans CJK for Japanese character support
- **Search**: Pagefind for client-side search functionality
- **Language**: TypeScript for type safety and developer experience

## Backend & Build System
- **Runtime**: Deno (JavaScript/TypeScript runtime)
- **Build System**: Lume's integrated build pipeline
- **Font Management**: Custom font downloading script for OG image generation
- **Asset Optimization**: Built-in image optimization and responsive picture generation
- **Compression**: Brotli and Gzip compression for production builds

## Development Environment
- **Package Manager**: Deno's built-in package management
- **Task Runner**: Deno tasks (defined in `deno.jsonc`)
- **Alternative Tools**: Just commands for blog management workflows
- **Shell Integration**: Nu shell scripts for content creation workflows

## Deployment & Hosting
- **Primary Host**: Cloudflare Pages
- **Domain**: `comamoca.dev`
- **Build Environment**: Automated builds on git push
- **CDN**: Cloudflare's global CDN network

## Common Development Commands

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

### Content Management (with Just)
```bash
# Open blog posts for editing (requires nu shell and fzf)
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

### Development Tools
```bash
# Format code with Nix
nix fmt

# Enter development shell
nix develop
```

## Environment Variables
- **RELEASE**: Controls production features (minification, compression, SEO plugins)
  - `RELEASE=1`: Enables full production optimizations
  - Development: Simplified build for faster iteration

## Configuration Files
- **Primary Config**: `_config.ts` - Main Lume configuration
- **Deno Config**: `deno.jsonc` - Deno runtime and task configuration
- **Styling Config**: `tailwind.config.js` - TailwindCSS configuration
- **Development Nix**: `flake.nix` - Nix development environment

## Plugin Architecture
- **Custom Plugins**: Located in `plugins/` directory
- **Link Cards**: `linkcard.ts` - External link preview generation
- **Footnotes**: `plugins/lume/footnote.ts` - Custom footnote processing

## Performance Optimizations
- **Production Mode**: Minification, compression, and asset optimization
- **Image Processing**: Automatic responsive image generation
- **Font Loading**: Strategic font loading for OG image generation
- **Static Generation**: Pre-built HTML for optimal loading performance

## Security Considerations
- **Static Site**: No server-side vulnerabilities
- **Content Security**: Markdown processing with safe rendering
- **Font Security**: Controlled font downloading from trusted sources
- **Deployment Security**: Cloudflare's security features and SSL/TLS

## Development Workflow
1. **Content Creation**: Markdown files with frontmatter
2. **Component Development**: TSX files with async function exports
3. **Local Development**: Hot reload with `deno task serve`
4. **Production Build**: Full optimization with `deno task build`
5. **Deployment**: Automated via Cloudflare Pages on git push

## Dependencies Management
- **Runtime Dependencies**: Managed through Deno's import system
- **Lock File**: `deno.lock` ensures reproducible builds
- **Version Control**: Import URLs specify exact versions
- **Security**: Deno's permission system provides sandboxing