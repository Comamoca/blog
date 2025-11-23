# Project Structure

## Root Directory Organization

```
/
├── src/                    # Main source directory
├── plugins/               # Custom Lume plugins
├── scripts/               # Build and utility scripts  
├── utils/                 # Shared utility functions
├── tests/                 # Test files
├── tools/                 # Development tools and migration scripts
├── _config.ts             # Main Lume configuration
├── deno.jsonc             # Deno configuration and tasks
├── tailwind.config.js     # TailwindCSS configuration
├── justfile               # Just command definitions
└── flake.nix              # Nix development environment
```

## Source Directory Structure (`src/`)

### Component Organization
```
src/
├── _components/           # Reusable React components (TSX)
│   ├── Header.tsx        # Main site header with navigation
│   ├── Footer.tsx        # Site footer
│   ├── PostList.tsx      # Blog post listing component
│   ├── PostCard.tsx      # Individual post preview card
│   ├── Search.tsx        # Site search functionality
│   ├── BaseHead.tsx      # HTML head component
│   ├── Logo.tsx          # Site logo component
│   └── Twemoji.tsx       # Emoji rendering component
```

### Layout Templates
```
src/_includes/
└── layouts/
    ├── main.tsx          # Main page layout
    ├── post.tsx          # Blog post layout
    ├── mainOgImage.tsx   # OG image layout for pages
    └── postOgImage.tsx   # OG image layout for posts
```

### Page Components
```
src/
├── index.page.tsx        # Homepage
├── 404.page.tsx          # Error page
├── diary.page.tsx        # Diary listing page
├── hub.page.tsx          # Hub/navigation page
├── all.page.tsx          # All posts listing
├── me.page.tsx           # About/profile page
└── info.page.tsx         # Site information page
```

### Content Organization
```
src/
├── blog/                 # Blog post markdown files
│   ├── _data.js          # Blog directory metadata
│   ├── YYYY-MM-DD-title.md           # Regular blog posts
│   └── YYYY-MM-DD-diary.md           # Daily diary entries
└── img/                  # Image assets
    └── _data.js          # Image directory metadata
```

### Shared Code
```
src/
├── consts.ts             # Site constants and configuration
└── types.ts              # TypeScript type definitions
```

## Plugin Directory Structure (`plugins/`)

```
plugins/
├── linkcard.ts           # External link card generation
└── lume/
    └── footnote.ts       # Custom footnote processing plugin
```

## Utility and Script Organization

### Utilities (`utils/`)
```
utils/
├── logger.ts             # Logging utilities
└── fetchogp.ts           # Open Graph data fetching
```

### Scripts (`scripts/`)
```
scripts/
└── downloadFonts.ts      # Font downloading for OG image generation
```

### Tools (`tools/`)
```
tools/
└── migrate_meta.ts       # Metadata migration utilities
```

## File Naming Conventions

### Component Files
- **Components**: PascalCase TSX files (e.g., `PostCard.tsx`)
- **Pages**: kebab-case with `.page.tsx` suffix (e.g., `diary.page.tsx`)
- **Layouts**: kebab-case TSX files in `_includes/layouts/`

### Content Files
- **Blog Posts**: `YYYY-MM-DD-title.md` format
- **Diary Entries**: `YYYY-MM-DD-diary.md` format
- **Data Files**: `_data.js` for directory-specific metadata

### Configuration Files
- **TypeScript**: `.ts` extension for utilities and types
- **Configuration**: Descriptive names (e.g., `_config.ts`, `tailwind.config.js`)

## Import Organization

### Component Imports
- **Relative imports** for local components and utilities
- **Absolute imports** for external dependencies via Deno's import system
- **Type imports** separated using TypeScript's `import type` syntax

### Lume Plugin System
- **Built-in plugins**: Imported from Lume core
- **Custom plugins**: Imported from local `plugins/` directory
- **Configuration**: Centralized in `_config.ts`

## Key Architectural Principles

### Component Architecture
- **Async Components**: All components are async functions due to Lume v3 requirements
- **Single Responsibility**: Each component handles one specific UI concern
- **Composition**: Complex layouts built through component composition
- **Type Safety**: Full TypeScript integration for props and state

### Content Architecture
- **Markdown-First**: Content authored in Markdown with frontmatter
- **Date-Based Organization**: Posts organized chronologically by filename
- **Metadata Separation**: Directory-specific metadata in `_data.js` files
- **Asset Co-location**: Images stored alongside content when possible

### Build Architecture
- **Static Generation**: All content pre-rendered at build time
- **Plugin-Based**: Extensible through Lume's plugin system
- **Environment-Aware**: Different optimizations for development vs production
- **Type-Safe Configuration**: Configuration files use TypeScript for validation

### Development Patterns
- **Hot Reload**: Fast development with automatic rebuilds
- **Task-Based Workflow**: Common operations encapsulated in Deno tasks
- **Content Workflows**: Streamlined content creation through Just commands
- **Version Control**: Git-based workflow with automated deployment

## Data Flow Patterns

### Content Processing
1. **Markdown Files** → Lume processing → **Static HTML**
2. **Component Logic** → SSX rendering → **Generated markup**
3. **Asset Files** → Optimization plugins → **Optimized assets**
4. **Configuration** → Build pipeline → **Site generation**

### Search Integration
1. **Content** → Pagefind indexing → **Search index**
2. **User Query** → Client-side search → **Results display**
3. **Static Generation** → Search component → **Search interface**

This structure supports efficient development, content management, and deployment while maintaining clear separation of concerns and scalability for future growth.