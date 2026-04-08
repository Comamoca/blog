---
title: "nix-portableで開発環境をシングルバイナリにする"
description: "Nixを使うと開発環境をどこでも持ち運べるようになる"
pubDate: "Apr 8 2026"
emoji: 🦊
tags: ["tech", "nix", "nix-portable"]
draft: false
---

VPSで開発環境を構築する方法を調べている時にnix-portableでdevShellをbundleできることを発見したので試してみた。
この方法を使うと開発環境を単一バイナリにできる。

## 概要

[nix bundle](https://nix.dev/manual/nix/2.24/command-ref/new-cli/nix3-bundle)を用いて開発環境を提供するderivationを単一バイナリにbundleする。
mkShellはderivationを提供しないため、devshellの定義には[numtide/devshell](https://github.com/numtide/devshell)を使用する。

## やり方

- `numtide/devshell`を使用してdevShellを定義したflakeを用意する。この時、`packages`に`pkgs.nix`を含めること。
- `nix bundle --bundler github:DavHau/nix-portable -o devshell .#devShells.{system}.default`でbundleする。
  - `{system}`の箇所は`x86_64-linux`など、ターゲットのアーキテクチャに合わせる。
- `./devshell/bin/devshell`に実行ファイルが作成される。これを実行すると開発環境に入れる。

詳細はサンプルを参照して欲しい。

https://github.com/Comamoca/sandbox/tree/main/portable-devshell

## 仕組みの説明

NixにはDerivationを単一バイナリにbundleする`nix bundle`というコマンドがあって、このコマンドを使用すると任意のDerivationを単一バイナリにできる。
また、nix bundleはbundlerを指定することで任意の方法でbundleすることが可能。

nix-portableはこのbundlerを提供することで、devShellをDerivationと見なし単一バイナリへと変換できる。

nix bundleについては過去に記事を書いたので、そちらも参照して欲しい。

https://comamoca.dev/blog/2025-12-17-build-gleam-erlang-target-to-single-binary-with-nix/

## これが役に立つ場面

インストールできるOSに制限のあるVPSとかで、環境をきれいに保ちつつNixで構築した環境を使う場面とかで役に立ちそうだと思った。
単一バイナリなのでDockerより手軽に環境を他者に投げられるので、環境の共有という面でも役に立ちそう。

## 問題点

- 開発環境に含めるツールが多いほどバンドルサイズが増加する。
  - 自作した[サンプル](https://github.com/Comamoca/sandbox/tree/main/portable-devshell)は350MBほどだった。
  - bundlerに`github:DavHau/nix-portable#zstd-max`を使用すると圧縮にzstdを使用することもできる。この場合は277MBだった。初回起動に数秒かかるけど、サイズ削れるのでこっちの方が良いのかもしれない。
- devShellの作成に`numtide/devshell`を使用する必要があるため、既存の開発環境から移行するのにコストがかかる。
- [service-flakes](https://github.com/juspay/services-flake)のような高級なserviceを作成するモジュールが使用できない。
- 一応`numtide/devshell`にもserviceを実行する機能はあるが、ただ複数コマンドをwrapするだけなのでservice-flakeと比較して貧弱。
