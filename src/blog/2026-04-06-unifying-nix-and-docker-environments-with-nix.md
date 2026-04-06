---
title: "NixでNixとDockerイメージの環境を共通化する"
description: "NixとDockerを併用するノウハウについて"
pubDate: "Apr 6 2026"
emoji: 🦊
tags: ["tech", "nix", "docker"]
draft: false
---

現時点で記事の体裁を整える気力がないので箇条書きのまま公開します。
完全版はZennとかに公開するかもです。

あとさも実務で使ってるかのような書きっぷりをしていますが、僕は**Nixを実運用で使ったことがないので全部想像となっています。**
どなたかこの記事を参考に実運用した方がいたら感想を聞かせて欲しいです。

この手法を使っているリポジトリとして以下があるので、参考までにリンクを貼っておきます

https://github.com/Comamoca/gleam-by-example

---

- nixを使うと再現性のある環境が作れて嬉しい
- しかし、全員がnixを使っている訳ではない
  - 全員がnixを使用するようにするのもコストがかかる
    - ツールの学習コストを組織で支払うか、個人で支払うか問題
  - ただ使うだけも悪くないが、トラブルが発生した際に自己解決できないため一定のリスクがある
    - リスクを鑑みると全員がNixを扱うようにするのはハードルが高い
    - Nixの特性上、ストレージと帯域、CPUにRAMとリソースをかなり消費するため、それが気になる人がいる事も予想される
      - :bram:案件と言われればそう
    - 自己解決できない人は引き続きDockerを使う運用がバランスが良い
      - イメージの管理が俗人化する問題はあるが、Nixのメリットと天秤にかけて十分飲める代償と考えている
    - そもそもそのリスクとコストが払えない環境でNixもといメジャーではない技術を使うべきではない
- dockerと並行して環境を管理する必要がある
  - 2重管理になりコストがかかる
  - Docker内でNixを実行する方法
    - [DevContainer上でNix Flake環境を構築する](https://www.ncaq.net/2026/01/16/14/18/49/)
    - Dockerのレイヤー上でNixのCacheを管理できないため、調整などを行う際にそこそこの頻度でNix側のフルビルドが走る
    - Nix側のビルドがDocker側のビルドに上乗せされるため、ビルド時間が長くなりつらい
      - :bram:すれば解決できるかもしれない
- 解決策: Docker Image自体もNixでビルドし、全てNixで管理する
  - 全ての環境構築をNixの上に載せられるため、Nixの恩恵を受けられる
  - NixでDocker Imageをビルドすると、Scratchイメージからのビルドが容易
    - Scratchイメージを使用してイメージを作成した場合、Nixによって解決された依存関係が静的に配置されるため、事実上のdistrolessと同等になる
    - [distrolessコンテナイメージの中を覗いて「なんか軽くてセキュアらしい」より理解を深める](https://www.m3tech.blog/entry/2026/04/03/180000)
    - 依存が固定化されるため「数年越しのDocker
      Imageが壊れている」問題を解消できる
- 実際の手順
  - 予めdevShellを定義する
    - アプリケーションを動かすのに最低限必要な依存を変数として定義しておく
    - devShellや開発用Docker
      Imageなど、開発時に必要な依存も別途変数として定義する
    - それぞれの環境を作成する際にアプリケーションの依存へ追加する形で依存を定義すると依存の管理が楽になる
    - devDocker Image.pkgs = deps ++ devDocker ImageDepsのような感じ
  - 開発用のDocker
    Imageにはshellが含まれていた方が使い勝手が良いが、Scratchから作成した場合は含まれていない
    - 開発用Docker Imageに必要な依存は別で変数に定義する
  - pkgs.dockerTools.buildDocker Imageでイメージをビルドする
    - 具体的な方法は既存の記事を参考にする
- nix buildにて、Docker Imageがビルドされる
  - 従来のnix buildと同様に、result/へビルド済みイメージが出力される
  - このイメージをdocker load すれば良い

- CI
  - 手元でnix
    buildする運用も悪くないが、結局手元のマシンでNixを実行しているため先述した問題を完全に解決できていない
  - Dockerしか使わない人はdockerコマンドを叩くだけで済むようにしたい
  - GitHub Actionsを用いてDocker Imageをビルド、コンテナレジストリへpushする
  - Docker Imageがpushできれば良いため、任意のレジストリ(ECR, Cloudflare
    Containers等)が使えるが、こだわりがない場合はGHCRをオススメする
    - GHCRはGitHubが提供するコンテナレジストリ。DockerHubより制限が緩くActionsとの相性も良い
    - (実際のサンプルコード)
  - レジストリに上げてしまえば利用者はdocker
    pullをすれば良いため、Nixを実行する必要がなくなる
  - また、レジストリに上げたことでビルドしたDocker
    Imageをイメージ名でどこからでも参照できるようになった
  - devcontainerからも参照が可能
  - 別途devcontainerの設定を作成し、イメージにNixでビルドしたイメージを指定することで、VSCode環境ならdocker
    pullするまでもなく開発環境へアクセスできる

- 課題
  - Nixではdocker-compose環境を上手く表現できない
  - service-flakes等はあるが、docker側とは両立できる訳ではない
    - Nixのみの環境ならservice-flakesに寄せるのが妥当
  - 複数のコンテナのオーケストレーションに関してはdocker-composeの方に分がある
    - 複数コンテナの実行だけは全員docker-composeに寄せるのが良さそう
  - 内部で使用しているイメージさえNixでビルド出来ていれば安定性は担保できる
    - いいとこどりが出来る

- まとめ
  - NixはDocker Imageが作成できる
  - Nixの特性を生かすことでセキュアかつ安定したDocker Imageを作れる
  - ビルドしたイメージをレジストリにpushする事で、利用者側は環境構築をdockerコマンドで
    完結できるため、Nixを導入する難易度を大幅に下げられる
