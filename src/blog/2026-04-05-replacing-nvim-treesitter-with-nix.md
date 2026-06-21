---
title: "Nix home-managerでnvim-treesitterを代替する"
description: "home-managerを使う任意のファイルを任意の場所に配置できて便利"
pubDate: "Apr 5 2026"
emoji: 🦊
tags: ["tech", "nix", "neovim"]
draft: false
---

### nvim-treesitterがアーカイブされた

2026/4/4 nvim-treesitterがアーカイブされました。

https://github.com/nvim-treesitter/nvim-treesitter

事情についてはこのgistが詳しいです。

https://gist.github.com/delphinus/9b231465a1128ab844029ed52150adc2

nvim-treesitterについて簡単に説明すると、パーサ生成ツールであるtree-sitterをNeovimで使用する際の支援を行うプラグインです。
例えば以下の機能を提供しています

- パーサーのインストールや更新、削除などの管理
-

https://zenn.dev/duglaser/articles/c02d6a937a48df

アーカイブは技術的な理由ではないため復活する可能性はありますが、既にNixを導入している方はこの機会に移行してしまうのも良いのかなと思っています。
また、Nixを用いるとキャッシュが効くので手元のマシンでパーサーのビルドを行わずに済むというメリットもあります。

## nixpkgsにはnvim-treesitter向けのビルド成果物がある

nixpkgsには既におあつらえ向きのパッケージが用意されているため、これを使います。

pkgs.vimPlugins.nvim-treesitter
