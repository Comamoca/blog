---
title: Neovimでmoonbitを書こう
description: Neovimでmoonbitを書く設定について
pubDate: Oct 6 2024
emoji: 🦊
tags: []
draft: false
---

moonbitもくもく会でNeovimのmoonbit設定を書いたので共有してみる。

実際の設定はここから見れる。

moonbit_lsp.lua:

https://github.com/Comamoca/dotfiles/blob/main/config/nvim/lua/configs/moonbit_lsp.lua

lsp.lua:

https://github.com/Comamoca/dotfiles/blob/e106781f1c1240d7622980a1a1249d8584174ce5/config/nvim/lua/configs/lsp.lua#L12-L14

lsp.toml(vim):

https://github.com/Comamoca/dotfiles/blob/37a580948db0ba5fdc6889380d62a8efc42d8a0f/vim/lsp.toml#L24-L30

## moonbitのLSPについて

クローズドソースだけどパッケージは公開されている。
Bunでも動くっぽいので自分はBunでインストールした。

https://www.npmjs.com/package/@moonbit/moonbit-lsp

```sh
npm install -g @moonbit/moonbit-lsp
```

## filetype

まずmoonbitのファイルを認識させるためにfiletypeを設定する。

Neovim(lua)だとこんな感じ。

```lua
vim.api.nvim_create_autocmd("BufRead", {
  pattern = "*.mbt",
  command = "set filetype=moonbit",
})
```

VimとNeovim(Vim script)だとこんな感じ。

```vim
autocmd BufRead *.mbt set filetype=moonbit
```

## lspconfig

こんな感じで書く。

普通に`moonbit-lsp`コマンドを実行しているだけ。

```lua
local util = require 'lspconfig.util'

return {
  default_config = {
    cmd = { 'moonbit-lsp' },
    filetypes = { "moonbit" },
    root_dir = util.root_pattern 'moon.mod.json',
  },
  docs = {
    description = [[
The moonbit language server.
]],
  },
}
```

```lua
local server_config = require('lspconfig.configs')
server_config.moonbit = require "configs/moonbit_lsp"

lspconfig.moonbit.setup({})
```

試してはないけど1ファイルでも動かせると思う。

```lua
local server_config = require('lspconfig.configs')
local util = require 'lspconfig.util'
server_config.moonbit = {
  default_config = {
    cmd = { 'moonbit-lsp' },
    filetypes = { "moonbit" },
    root_dir = util.root_pattern 'moon.mod.json',
  },
  docs = {
    description = [[
The moonbit language server.
]],
  },
}

lspconfig.moonbit.setup({})
```

## quickrun

`tempfile: '%{tempname()}.mbt'`はなくても動くかもしれないけど動作確認はしていない。

```vim
let g:quickrun_config = {
\   "moonbit" : #{
\     type: 'moonbit/run',
\   },
\  'moonbit/run': #{
\    cmdopt: 'run',
\    command: 'moon',
\    tempfile: '%{tempname()}.mbt',
\  },
}
```

## vim-lsp

ついでにvim-lspでもやってみた。

こっちはよくサーバー追加してたので簡単だった。

```vim
if executable('moonbit-lsp')
  au User lsp_setup call lsp#register_server({
      \ 'name': 'moonbit',
      \ 'cmd': ["moonbit-lsp" ],
      \ 'allowlist': ['moonbit'],
      \ })
endif
```

今日のもくもく会は設定まわりで終わってしまったので、ちゃんと構文とかも触っていきたい。
