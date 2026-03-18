---
title: "devenvやめたい"
description: "案外他のツールで代用できそうだった"
pubDate: "Mar 19 2026"
emoji: 🦊
tags: ["tech", "nix", "devenv"]
draft: false
---

devenvを使うのをやめたいと思ってるので、その理由と今後の対応とかを書いてみる。

## 動機

`nix update`した時に走るビルドのコストが無視できないレベルになったから。
それに追加して、devenvのCLIをそこまで使ってなかったので、割に合わないなと感じることが多かったから。

devenvはyamlからflakeを生成して再現可能な環境を作るツールだけど、flake-partsを使うと直接flake.nixから使える。
この場合はdevenv CLIを使わずに、直接flakeのinputとして扱う。

また、`devenv up`でprocess-composeを使ったサービスの起動ができる。
個人的にはこの用途でdevenv CLIを使うことが多かった。

あと言語などのバージョンを"0.14.0"みたいに指定できるので、その機能もよく使っていた。
ただ、この機能に関してもそこまで必要性を感じなくなってきた。

## じゃあどうするのか

### サービスの起動

[services-flake](https://github.com/juspay/services-flake)を使う。これはprocess-composeをwrapしたnix
moduleで、実はこっちの方が対応しているサービスが多い。
サービスを定義して`nix run .#myservice`みたいに実行すればprocess-composeが起動する。

### バージョン指定

直接指定する。
ただ、楽をする方法があって、[Nix package versions](https://lazamar.co.uk/nix-versions/)を使う。(nixpkgs
ukとかで検索すると出てくる)
これは特定のバージョンのパッケージが存在しているnixpkgsのcommit
hashを検索するサイト。

このサイトでnixpkgsのhashを検索して、そのnixpkgsをinputsに指定、対象のパッケージを呼び出せば良い。
nixpkgsは複数存在しても良いため、この方法を使っても従来のnixpkgsは使用できる。

もう一つの方法として、overlayがある。
例えばPythonの場合は[nixpkgs-python](https://github.com/cachix/nixpkgs-python)がある。

もっといえば、このoverlayはdevenvの内部で使用されている。
overlayを直接使用することで依存が減り、nixのビルド時間も削減しつつdevenvで享受していた利益をほぼそのまま受けられる。

## まとめ

devenvをやめる理由と、devenvを使わずにそれと同じ開発体験を得る方法を書いてきた。
既にオレオレNixテンプレートリポジトリ[scaffold](https://github.com/Comamoca/scaffold/)ではdevenvを一部削除している。
今後もflake.nixでdevenvを見つけ次第削除していきたい。

今回の一件でnix前提で開発ツールを作る際はRustのビルド時間が結構重くのしかかってくると感じたので、もし僕が開発ツール作る際はGoかPythonを使っていこうかなと思ったりしている。
