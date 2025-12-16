---
title: "NixでGleam(Erlang)をシングルバイナリにする"
description: "nix bundleコマンドを使ってあらゆるパッケージをシングルバイナリにできる"
pubDate: "Dec 17 2025"
emoji: 🦊
tags: ["nix", "gleam"]
draft: false
---

この記事はNixアドベントカレンダー日目の記事です。

## nix bundle

Nixには`nix bundle`というUnstableながら便利なコマンドがあります。

https://nix.dev/manual/nix/2.24/command-ref/new-cli/nix3-bundle

これはNixの依存関係を単一のバイナリにまとめ、単一の実行ファイルを生成できるというものです。

例えば、以下のコマンドを実行すると単一のPython 3.14バイナリが生成されます。

```sh
nix bundle --bundler github:ralismark/nix-appimage nixpkgs#python314
```

## bundler

`--bundler`オプションを指定すると、バンドルするアルゴリズムを変更できます。
例えば、`github:ralismark/nix-appimage`と指定すればAppImageとしてシングルバイナリを生成できます。

https://github.com/ralismark/nix-appimage

さきほどのPython 3.14をAppImageでバンドルするにはこうします。

```sh
nix bundle --bundler github:ralismark/nix-appimage nixpkgs#python314
```

AppImageは使用するファイルのみ都度自己解凍する仕組みなので、従来のバンドル方法と比べて起動速度が速いです。
そのため、基本的にはAppImageを用いてバンドルするのがおすすめです。

## Gleamをバンドルする

これまでGleamでシングルバイナリを生成するには[garnet]()等のツールを用いるしかありませんでした。
これはDenoとBunを用いるため、JavaScriptに限定されてしまう問題がありました。

今回紹介した方法はGleamが使用するランタイムの機能に依存しないため、Erlangもシングルバイナリにできます。
試しにやってみたものがこちらにあります。`nix build`で単一バイナリが生成されるはずです。

https://github.com/Comamoca/sandbox-gleam/tree/main/appimage_build

GleamプロジェクトをNixでビルドするのには`gleam2nix`を使いました。
https://gleam2nix.foxgirl.engineering/

## まとめ

- `nix bundle`を使うと任意のpackageを単一バイナリにできる
- `--bundler`オプションでバンドル方法を切り替えられる
- AppImageを使用すると起動時間の速い単一バイナリが得られる
- GleamにおけるErlangターゲットなプロジェクトもこれで単一バイナリになる
- 便利だけどバイナリサイズは結構大きくなる(数百MBとか)
