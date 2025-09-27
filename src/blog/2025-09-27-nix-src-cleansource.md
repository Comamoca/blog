---
title: "Nixのsrc指定にはcleanSourceが良さそう"
description: "Nixのsrcを指定する時はpkgs.lib.cleanSourceを使うのが良さそう"
pubDate: "Sep 27 2025"
emoji: 🦊
tags: ["nix"]
draft: false
---

昨日はcalude
codeに[gleam2nix](https://gleam2nix.foxgirl.engineering/)っていうGleamパッケージをNixでビルドするモジュールを使ってflakeを書かせていた。
翌日起きて該当のflakeを見たらsrcに`pkgs.lib.cleanSource`という記述があって、調べたらドキュメントに「`.git`とかバージョン管理系のファイルとかを除外する関数だよ」と書いてあった。

https://nixos.org/manual/nixpkgs/stable/#function-library-lib.sources.cleanSource

なるほど、`.git`はNixのビルド工程において必要はないし、コピーしないに越したことはないよなと。
もし除外したいファイルを指定したい時は`cleanSourceWith`を使えばできるらしい 。

https://nixos.org/manual/nixpkgs/stable/#function-library-lib.sources.cleanSourceWith

という訳で、今後Nixでsrc指定する時は`cleanSource`を使ってみようかなという話でした。

追記:
[@kuu](https://github.com/kuuote/)さん曰く、Flakeを使っているならsrcは自動的にcleanSource相当の処理が適用されるらしいです。ありがとうございます。
