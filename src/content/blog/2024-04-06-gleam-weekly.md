---
title: '4/6 Gleam Weekly'
description: 'Gleam Weeklyの内容を勝手に解説していきます。'
pubDate: 'Apr 6 2024'
emoji: '🦊'
---

Gleam Weeklyの3つめが配信されました。

https://gleamweekly.com/issues/3/

前回から3日しか経っていないですが次が来たので書いていきます。

今回から自分が気になったトピックだけ書いていきます。

## This week in Gleam

### Supervisors (3/3)

https://code-change.nl/gleam-blog/20240326-monitoring-processes.html

前回の続編です。今回はスーパーバイザーを用いたプロセスの監視について解説しています。
Erlang VMの醍醐味とも言えるのでこれについても解説していきたいです。

### Ivy language

https://github.com/RyanBrewer317/ivy

Gleamで書かれたスクリプト言語ivyがリリースされました。
まだ基本的な型と関数程度しか実装されていませんが、Gleamは言語が実装できるレベルの機能を持っているという実証になると思います。

### A little webring in Gleam

https://erikarow.land/notes/gleam-webring

GleamでWebringを実装したというブログ記事です。
Webringとは、共通のテーマを扱っているサイト同士をリンクで繋ぎ、文字通りリングのようにグルグル回れるようにしたものです。
検索エンジンのようにクロールする必要もなく、インターネット初期によく使われたそうです。
自分もFFの人達でwebringやってみたい...

## Even more great Gleam stuff

### Gleam bindings to Erlang's code module Project update

https://github.com/grodaus/glcode

GleamとErlangコードをバインディングするライブラリです。
正直@externalとの差異が分からなかったのでもう少しちゃんと調べたいです。

### Carpenter, ETS bindings in Gleam Project update

https://github.com/grottohub/carpenter

GleamでETSを扱うライブラリとして[gts](https://github.com/lunarmagpie/gts)というものがあるのですが、現在のバージョンでは動かなくなっています。
その代替としてgtsをforkして作られたのがこのライブラリになります。自分もgtsが動かなくて代替を作ろうと思っていたのでありがたい。

### Remote data for Gleam, Elm inspired Project update

https://hexdocs.pm/remote_data/index.html

ElmのRemote_dataにインスパイアされて作られたLustreでリモートデータを取得するライブラリです。
Elmのことがよく分からない[^1]のでなんとも言えないですが、副作用を共なうデータフェッチをクリーンに書けそうで良さそうな気がします。

## 余談

段々ライブラリや紹介動画や記事が増えてきていて、Gleamの人気が高まってきていると感じる内容でした。
来週のGleam Weeklyも楽しみです。

[^1]: 以前ハンズオンで触った程度。Elmアーキテクチャへの理解を深めるためにも触っていきたい。
