---
title: 'Nixで秘密鍵のお漏らしを阻止する'
description: 'Flakeでクレデンシャルを漏らさない仕組みを作る話'
pubDate: 'Nov 11 2024'
emoji: '🦊'
tags: []
---

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">秘密鍵pushする事故自分も何回かやってるし、pre-commitとsecretlintとNixで秘密鍵pushできないようにするやつやるか</p>&mdash; こまもか🦊 (@Comamoca_) <a href="https://twitter.com/Comamoca_/status/1853308840948961696?ref_src=twsrc%5Etfw">November 4, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

これをやった。


## 構成

- git-hooks
- git-secrets

git-hooksはpre-commitをNixで扱いやすくしたもの。なので実質pre-commitと考えてOK。

git-secretsはAWS LabsっていうAWS向けのサービスを公開してるところから公開されてるもの。
クレデンシャル検知ツールはsecertlintがデファクトなのだけど(多分)、シェルクスリプトで書かれてるのでNixでも扱いやすいと考えて今回はこれを採用した。

## pre-commitについて

GitにはGit Hooksっていう`.git/hooks`配下のスクリプトを実行する機能があるのだけど、それを補助するのがpre-commitになる。
これらのスクリプトはコミットの前に実行されるためこのような名前になっている。(だと思う)

これだけ聴くと便利なツールだと思うのだけど、pre-commitは**Pythonで書かれている**。
これを聞くとウッとなる人も多いんじゃなかろうか。

環境依存のトラブルが多いPythonを**commit時のチェックのためだけに**導入するのは結構勇気がいると思う。

そこでNixを使う。
Nixを使うとプロジェクト毎にPythonの環境を隔離するのなんて訳ないし、なんなら他のツールもまるっと隔離できる。

## 実際のコード

このブログのflakeには既に導入してある。
残念ながらgit-hooksにはまだgit-secretsが対応してないので、任意のhooksとして設定する。


```nix
pre-commit = {
  check.enable = true;
  settings = {
    hooks = {
      # フォーマットされてるかチェック
      nixfmt-rfc-style.enable = true; 
      # カスタムHookを設定する
      git-secrets = {
        enable = true;
        name = "git-secrets";
        entry = "${git-secrets}/bin/git-secrets";
        language = "system";
        types = [ "text" ];
      };
    };
  };
};
```

`entry`には実行可能なスクリプトを指定できるので、`writeShellApplication`で実行可能なshell scriptを作成してそのパスを指定している。

```nix
git-secrets = pkgs.writeShellApplication {
  name = "git-secrets";
  runtimeInputs = [ pkgs.git-secrets ];
  text = ''

	'^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z0-9]{4}$'
    git secrets --scan
  '';
};
```

`writeShellScriptBin`とかでも良いのだけど、実行時の依存とかを考えてこう書いていた。
結局使わなかったし、いざ使う時はstore pathを指定すれば良いから必要なかったなと思っている。

## 任意のpatternを追加する

git-secretsはAWS Labsが作っているので当然AWSのサポートはされている。
ただ多くの場合はそれ以外パターンにも対応して欲しいだろう。

そういう場合は`git secrets --add hogehoge`で正規表現を追加できる。
これを毎回やるのは面倒なのでshellHookに書いてしまうのがオススメ。

以下はBlueskyのアプリケーションパスワードにマッチするpatternをdevShellに入った時に追加する設定。

```nix
shellHook = ''
    ${pkgs.git-secrets}/bin/git-secrets --add '''^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z0-9]{4}$'
'';
```

また、これらのパターンをまとめたものとして**provider**というものがあり、これもカスタムできる。
実態はただのpatternを出力する実行ファイルなので`mkDerivation`なり前述した`writeShellApplication`なりが使える。

これについては後日使ってみたらその時また記事を書いてみようと思う。

## まとめ

- pre-commitは普通に便利
- Nixを使うと「Pythonで書かれている」だけでツールの採用を諦めなくて良くなる
- Nixはビルドに使えなくても十分便利なのでドシドシ使おう

## 参考

pre-commitとgit-secretsが干渉することに思い当たらなかったので参考になった。

https://zenn.dev/anieca/articles/6a16e0f3664481
