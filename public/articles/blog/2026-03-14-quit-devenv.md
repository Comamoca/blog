---
title: "devenvやめたい"
description: ""
pubDate: "Mar 14 2026"
emoji: 🦊
tags: ["tech", "nix", "devenv"]
draft: false
---

devenvを使うのをやめようかなと考えているので、その理由と今後の方針をまとめていく。

## 理由

devenvはRust製のCLIツールで、基本的にymlファイルに設定を記述する。
その記述を元にNix式が生成され、環境が構築される。
また、`devenv up`コマンドを用いてプロセスを起動・管理できる。

もう一つの使用方法として、flake-partsを用いた方法がある。
flake-partsはflakeを再利用可能な形で公開・利用するためのモジュールシステムで、様々なモジュールがflake-parts経由で利用できる。

僕はdevenvをこのflake-parts経由で利用しているため、devenv
CLIのうちNix式を生成する機能を使っていない。

普段あまり使用していないツールなのにも関わらず、flakeを更新する度にビルドのコストを払う必要があるのに納得できなくなったからというのが理由。

## 機能の代替手段

### バージョン指定

devenvの特徴として、言語のバージョンを簡単に固定できるものがある。

例えば、PHPのバージョンを固定したかったら以下のように指定すれば良い。

```nix
languages = {
    php = {
        enable = true;
        version = "8.4";
    };
};
```

この機能目当てでdevenvを使っていたけれど、バージョンを固定したかったらnix-versionを使って、特定のバージョンのパッケージがあるnixpkgsのhashを指定すればバージョン指定ができる。

https://lazamar.co.uk/nix-versions/

もし頻繁にバージョンを指定し、変更する必要がる際はoverlayを作るなり使うなりしてカバーできる。
例えばPythonでバージョン固定したかったら[nixpkgs-python](https://github.com/cachix/nixpkgs-python)が使える。
なんならdevenv自体が内部でこのモジュールを使っている。

### devenv up

`devenv up`に相当する機能は[service-flakes](https://github.com/juspay/services-flake)というnix
moduleで代替できる。

service-flakesは内部でprocess-composeというdocker
composeのdocker抜きみたいなツールを使用して、Nixで定義したサービス(Postgre,
Redis等)を起動できる。

devenvもデフォルトでprocess-composeを使用しているため、サービスを起動する機能もこれらのモジュールで代替できる。

https://devenv.sh/supported-process-managers/process-compose/

## まとめ

devenvが持っている機能を他のflake
modulesで代用することにより、devenvに依存しないflakeを作った。
最近CLIツールの開発にRustが使われることが多いが、ハードなユースケースが想定されないツールについては、ビルト時間の増加というそこそこ重いコストがかかる。

既にオレオレflakeテンプレート集である[scaffold](https://github.com/Comamoca/scaffold/)に関しても、基本的なflakeテンプレートである[flake-basic](https://github.com/Comamoca/scaffold/tree/main/flake-basic)についてdevenv関連の処理を削除している。
今後は自身のプロジェクトから段階的にdevenvを削除していこうと思う。

今回は、ことnix周辺のツールのように、ビルドされるタイミングが多いものに関しては、GoやPython等を使用して開発する方が使用する際の体験が良くなるという気付きを得ることができた。
もし僕がNix周辺のツールを作る際は、そのことを気に留めつつツールを作っていきたい。
