---
title: 4/6 Gleam Weekly
description: Gleam Weeklyの内容を勝手に解説していきます。
pubDate: Apr 6 2024
emoji: 🦊
draft: false
---

Gleam Weekly の 3 つめが配信されました。

https://gleamweekly.com/issues/3/

前回から 3 日しか経っていないですが次が来たので書いていきます。

今回から自分が気になったトピックだけ書いていきます。

## This week in Gleam

### Supervisors (3/3)

https://code-change.nl/gleam-blog/20240326-monitoring-processes.html

前回の続編です。今回はスーパーバイザーを用いたプロセスの監視について解説しています。
Erlang VM の醍醐味とも言えるのでこれについても解説していきたいです。

### Ivy language

https://github.com/RyanBrewer317/ivy

Gleam で書かれたスクリプト言語 ivy がリリースされました。
まだ基本的な型と関数程度しか実装されていませんが、Gleam
は言語が実装できるレベルの機能を持っているという実証になると思います。

### A little webring in Gleam

https://erikarow.land/notes/gleam-webring

Gleam で Webring を実装したというブログ記事です。 Webring
とは、共通のテーマを扱っているサイト同士をリンクで繋ぎ、文字通りリングのようにグルグル回れるようにしたものです。
検索エンジンのようにクロールする必要もなく、インターネット初期によく使われたそうです。
自分も FF の人達で webring やってみたい...

## Even more great Gleam stuff

### Gleam bindings to Erlang's code module Project update

https://github.com/grodaus/glcode

Gleam と Erlang コードをバインディングするライブラリです。 正直@external
との差異が分からなかったのでもう少しちゃんと調べたいです。

### Carpenter, ETS bindings in Gleam Project update

https://github.com/grottohub/carpenter

Gleam で ETS
を扱うライブラリとして[gts](https://github.com/lunarmagpie/gts)というものがあるのですが、現在のバージョンでは動かなくなっています。
その代替として gts を fork して作られたのがこのライブラリになります。自分も gts
が動かなくて代替を作ろうと思っていたのでありがたい。

### Remote data for Gleam, Elm inspired Project update

https://hexdocs.pm/remote_data/index.html

Elm の Remote_data にインスパイアされて作られた Lustre
でリモートデータを取得するライブラリです。 Elm
のことがよく分からない[^1]のでなんとも言えないですが、副作用を共なうデータフェッチをクリーンに書けそうで良さそうな気がします。

## 余談

段々ライブラリや紹介動画や記事が増えてきていて、Gleam
の人気が高まってきていると感じる内容でした。 来週の Gleam Weekly も楽しみです。

[^1]: 以前ハンズオンで触った程度。Elm
    アーキテクチャへの理解を深めるためにも触っていきたい。
