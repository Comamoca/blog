---
title: 'オレオレNURリポジトリを構築する'
description: '独自のNURリポジトリを構築する方法'
pubDate: 'Nov 4 2024'
emoji: '🦊'
tags: []
---

オレオレNURを作ったのでその方法を書いていく。

https://github.com/Comamoca/nur-packages

## なぜNURリポジトリを自作するのか

Nixはflakeを使うことで自作したパッケージをリポジトリ単位で公開できる。
ただ、自作パッケージが増えていくとリポジトリが増えていく。

そこで、それらのリポジトリを1つに集約することで各リポジトリでやっていた形式的な作業を省略して、あとあとの管理も簡単にできる。

## nur-packages-templateを使ってリポジトリを作成する

nur-packagesを作るためのテンプレートリポジトリがある。
それを使ってリポジトリを作成していく。

https://github.com/nix-community/nur-packages-template

GitHubのテンプレート機能を使うと楽に作成できるのでお勧め。

作成されたリポジトリはこんな感じの構造になっている。

```
.
├── ci.nix
├── default.nix
├── flake.lock
├── flake.nix
├── lib
├── modules
├── overlay.nix
├── overlays
└─ pkgs
```

各ディレクトリの説明簡単にしていく。基本はnixpkgsと似たような感じになっている。

- lib
  ライブラリ関数があるディレクトリ。
- modules
  NixOS modulesがあるディレクトリ。
- overlays
  Overlayがあるディレクトリ。
- pkgs
  パッケージがあるディレクトリ。

独自にパッケージしたflakeを移したいなら基本はpkgsを使うことになると思う。

## pkgsにパッケージを追加する方法

pkgs配下にディレクトリを作成する。
このディレクトリ名は(おそらく)パッケージ名に影響しないので、好きにして良いと思う。
ただ、分かりやすさのために同じにした方が良い。

ディレクトリを作成したら、その中に`default.nix`というファイルを作成する。
最終的にはこうなっているはず。

```
└── pkgs
    └── mypkg
        └── default.nix
```

`default.nix`というファイルはNixにおいて特別な名前になっている。
ディレクトリにこの名前にファイルがある場合、ほかのNixファイルから`import mypkg`という形式でimportできる。

Node.jsやっている人は`index.js`みたいなものだと考えても良いと思う。

## パッケージを定義する

パッケージは単一のDerivationを出力する関数として定義される。
[nur-packages-template](https://github.com/nix-community/nur-packages-template)のサンプルを見てみるとこんな風に定義されている。

```nix
{ stdenv }:

stdenv.mkDerivation rec {
  name = "example-package-${version}";
  version = "1.0";
  src = ./.;
  buildPhase = "echo echo Hello World > example";
  installPhase = "install -Dm755 example $out";
}
```

[pkgs/example-package/default.nix](https://github.com/nix-community/nur-packages-template/blob/master/pkgs/example-package/default.nix)

単純に`echo Hello World`が書き込まれた`example`という実行可能ファイルを作成する。
それを`$out`へとコピーする。

別に`cp`での良いのだけど、権限の設定などを一度に行えるため`install`が使われるケースが多い。
このDerivationでは`stdenv`を使っているので、引数に`stdenv`を指定している。

これはflakeで言う`output`関数の引数に近いもの。ここにnixpkgsのパッケージ名を指定するとそのパッケージ定義を参照できる。

## 外部から参照できるようにする

このままだと外部から参照できないので、外部から参照できるようパッケージ定義を追加する。

ディレクトリルートにある`default.nix`を開くとこんな感じのコードが書かれているはず。

```nix
# This file describes your repository contents.
# It should return a set of nix derivations
# and optionally the special attributes `lib`, `modules` and `overlays`.
# It should NOT import <nixpkgs>. Instead, you should take pkgs as an argument.
# Having pkgs default to <nixpkgs> is fine though, and it lets you use short
# commands such as:
#     nix-build -A mypackage

{ pkgs ? import <nixpkgs> { } }:

{
  # The `lib`, `modules`, and `overlays` names are special
  lib = import ./lib { inherit pkgs; }; # functions
  modules = import ./modules; # NixOS modules
  overlays = import ./overlays; # nixpkgs overlays

  example-package = pkgs.callPackage ./pkgs/example-package { };
  # some-qt5-package = pkgs.libsForQt5.callPackage ./pkgs/some-qt5-package { };
  # ...
}
```

[default.nix](https://github.com/nix-community/nur-packages-template/blob/master/default.nix)

`example-package`が該当の箇所になる。この記述をすることでパッケージ定義が公開され、外部から参照できる。

## Cachixを使う

これで外部から参照できるパッケージを定義/公開できた。
ただ、このままだとこのパッケージを参照したユーザーのマシンでもbuildが走ってしまう。

Nixは羃等性を担保する設計になっているので、**同じ定義ならどのマシンでビルドしても同等のバイナリが出力されることが保証される**。

この性質を利用したのがバイナリキャッシュと呼ばれるもので、Cachixと使うと簡単に個人単位のバイナリキャッシュを構築できる。

`.github/workflows/build.yml`を開く。
すでにworkflowの定義が記述されているので、後は指定された箇所を書き換えるだけで使えるようになる。

書き換える箇所は以下の通り。

- nurRepo\
  このテンプレート自体NUR(Nix User
  Repository)というリポジトリに登録するためのものになっている。
  これに登録したい場合はここに自身の名前を指定する必要がある。なおNURへの登録にはPRが必要なため、それをせず個人的なリポジトリとしても使用できる。

- cachixName\
  Cachixでキャッシュ作成時に指定した名前を指定する。
  たとえば、mycache.cachix.orgというキャッシュを使いたい場合は`mycache`を指定する。

### GitHub Secret

Cachixの認証で使用するSecretを設定する。

- CACHIX_SIGNING_KEY\
  Nixのバイナリは鍵で署名されているのだけど、それを指定するためのもの。
  今回は使わないけれど、気になる人は[Getting Started](https://docs.cachix.org/getting-started)から詳しい説明が載っている。

- CACHIX_AUTH_TOKEN\
  Cachixのサイトから生成できるトークン。今回はこれを使う。

以下の手順で`CACHIX_AUTH_TOKEN`を取得できる。

Cachixのキャッシュ一覧からダッシュボードを開き、Settingsを開く。 **Auth
Tokens**というというページがあるので、Generateボタンから生成できる。
するとトークンが表示されるのでコピーしておく。

トークンが取得できたらGitHubリポジトリの設定をしていく。
nur-packagesリポジトリのSettingsを開き、**Secrets and
variables**をクリックする。
一覧が展開されるので、一番上にある**Actions**をクリックする。
ページ下部に**Repository secrets**という項目があるので、その右にある**New
repository secret**ボタンをクリックする。 登録画面に遷移するので、

- Nameに**CACHIX_AUTH_TOKEN**
- Secretに**先程コピーしたトークン**

を入力し、**Add secret**をクリックする。

登録が完了したらリポジトリをpushする度にActionsが走ってCachixにキャッシュがアップロードされるのが確認できるはず。

## 実際に使ってみる

これでオレオレNURが構築できたので、実際に使ってみる。

まずflakeを用意する。

以下のコマンドを実行すると良い感じのFlakeが作成できるので、特にこだわりがない人はこれを使うのがお勧め。

```sh
nix flake init -t github:Comamoca/scaffold#flake-basic
```

`flake.nix`を開いたらinputsの要素に`nur-packages = "github:自分のユーザー名/リポジトリ名"`を追加する。
また、outputの引数に`nur-packages`を追加する。

今のところこうなっているはず。

```nix
inputs = {
  nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
  treefmt-nix.url = "github:numtide/treefmt-nix";
  flake-parts.url = "github:hercules-ci/flake-parts";
  systems.url = "github:nix-systems/default";
  nur-packages.url = "github:自分のユーザー名/リポジトリ名" # <- これを追加した
};
```

```nix
outputs =
  inputs@{
    self,
    systems,
    nixpkgs,
    treefmt-nix,
    flake-parts,
    nur-packages # <- これを追加した
  }:
```

次に、`nur = nur-packages.legacyPackages.${system};`を`stdenv = pkgs.stdenv;`の下に追加する。

こうなっているはず。

```nix
perSystem =
  {
    config,
    pkgs,
    system,
    ...
  }:
  let
    stdenv = pkgs.stdenv;
    nurpkgs = nur-packages.legacyPackages.${system}; # <- これを追加した

    # 以下省略
```

これで`nurpkgs.パッケージ名`でパッケージを参照できるようになった。

home-managerでこれらのパッケージを使う際は上記のようにinputsを定義して、
flake.nixが読み込むNixファイルで`nurpkgs = inputs.nur-packages.legacyPackages.${system};`と定義することで同様に利用できる。

定義した`nurpkgs`は通常のnixpkgsと同じ感覚で利用できる。
たとえば自分は[こんな感じ](https://github.com/Comamoca/dotfiles/blob/330a69d22600f9de5bc1073ba7eacb935668a7c2/home.nix#L595-L597)で使っている。

## まとめ

- オレオレFlakeが増えてきたらオレオレNURを構築すると便利
- Cachixを有効にすることでほかのユーザーがパッケージを利用した際にビルドを高速化できる
- 独自のNixリポジトリを構築することで、nixpkgsへのコントリビュートの足掛りとしても期待できる

オレオレNURで生活がますます便利になったと感じているので、これらかもNixしていきたい。
