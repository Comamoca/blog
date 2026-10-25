<div align="center">

![Last commit](https://img.shields.io/github/last-commit/Comamoca/blog?style=flat-square)
![Repository Stars](https://img.shields.io/github/stars/Comamoca/blog?style=flat-square)
![Issues](https://img.shields.io/github/issues/Comamoca/blog?style=flat-square)
![Open Issues](https://img.shields.io/github/issues-raw/Comamoca/blog?style=flat-square)
![Bug Issues](https://img.shields.io/github/issues/Comamoca/blog/bug?style=flat-square)

<img src="https://emoji2svg.comamoca.dev/api/🦊" alt="eyecatch" height="100">

# blog

My tech? blog.

<br>
<br>

</div>

<table>
  <thead>
    <tr>
      <th style="text-align:center">🍔English</th>
      <th style="text-align:center"><a href="README.ja.md">🍡日本語</a></th>
    </tr>
  </thead>
</table>

<div align="center">

</div>

## 🚀 How to use

See [this page](https://comamoca.pages.dev).

## ⛏️ Development

clone this repo, follow under commands.

```sh
bun install        # install dependencies
bun run dev        # dev server (http://localhost:5173)
```

All tasks live in `package.json` and run through Vite+'s task runner (`vp run
<task>`). `vp run` with no arguments lists them.

```sh
vp run test        # run the test suite (Deno)
vp run fmt         # format the code (Oxfmt)
vp run fmt:check   # check formatting without writing
vp run build       # production build into dist/
vp run preview     # serve the production build
```

Tests run on Vitest via `vp test` (or `vp run test`). They live in `tests/` —
see the Testing section in AGENTS.md for details.

### Writing posts

Articles are [org-mode](https://orgmode.org) files under `src/blog/`, named
`YYYY-MM-DD-title.org` (daily entries use the `-diary.org` suffix).

```sh
just new           # create a new blog post
just diary         # create a new diary entry
just open          # pick an existing post to edit (requires nu + fzf)
```

Add `#+DRAFT: true` to keep an article unpublished. Drafts show up in the dev
server only — they never reach the production build, feeds, sitemap, or search
index.

### With Nix

```sh
nix develop # to devshell
nix fmt     # formatting
```

## 📝 Todo

- [x] Search bar feature
- [ ] Recommend feature

## 🛠️ Tech stack

- [ox-content](https://github.com/ubugeeei-prod/ox-content) (Rust-core SSG) +
  Vite+ custom host
- TailwindCSS v4 + DaisyUI v5
- org-mode content pipeline (uniorg + Shiki)
- Pagefind for client-side search
- Cloudflare Pages for hosting, a Cloudflare Worker for OG images

## 📜 License

See [this page](https://comamoca.pages.dev/info).

## 👏 Affected projects

[Deno blog](https://deno.land/x/blog@0.5.0)

## 💕 Special Thanks

[CloudFlare](https://www.cloudflare.com/)
