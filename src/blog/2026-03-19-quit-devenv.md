---
title: "devenvやめたい"
description: "案外他のツールで代用できそうだった"
pubDate: "Mar 19 2026"
emoji: 🦊
tags: ["tech", "nix", "devenv"]
draft: true
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

2026/3/19 追記:

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">悲しいことにNix package versionsは更新が途絶えてます...<br>今だと<a href="https://t.co/4YLbyGloPr">https://t.co/4YLbyGloPr</a>で調べると良いかと思います<br><br>↓ここで紹介している、nix-versionsというツールも良さげです<br>CLIにてパッケージバージョンごとのNixpkgのリビジョンを検索できます<a href="https://t.co/71ngM90B1G">https://t.co/71ngM90B1G</a></p>&mdash; ryu (@ryu_trifolium) <a href="https://twitter.com/ryu_trifolium/status/2034448525535416802?ref_src=twsrc%5Etfw">March 19, 2026</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[@ryu](https://x.com/ryu_trifolium)さんがNix package
versionsの更新が停止していることを教えてくださった。ありがとうございます。
代替としては[nix-versions](https://github.com/vic/nix-versions)が良さそう。

追記終わり

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
