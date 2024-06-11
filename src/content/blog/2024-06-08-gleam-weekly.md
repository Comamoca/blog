---
title: '11-12 Gleam Weekly'
description: 'Gleam Weeklyの内容を勝手に解説していきます。'
pubDate: 'June 8 2024'
emoji: '🦊'
---

Gleam Weeklyの11と12がリリースされたので勝手に解説していきます。

issue 11

https://gleamweekly.com/issues/11/

issue 12

https://gleamweekly.com/issues/12/

## issue11

### This week in Gleam

#### Gleam 1.2.0 release - Fault tolerant Gleam

https://gleam.run/news/fault-tolerant-gleam/

Gleam v1.2.0がリリースされました。ここ1～2週間で一番デカい出来事と言えばこれですね。
今回のリリースは開発体験の向上が主となっています。現に自分も日々の開発で恩恵を受ける機会が多いです。

このリリースについてはZennでも解説しているので気になる方は是非読んでみてください。

https://zenn.dev/comamoca/articles/gleam-release-v1-2-0

#### Kielet 2.0.0 - A GNU Gettext implementation

KieletというGleamのgettext統合を提供するライブラリのv2.0.0がリリースされました。
gettextというのはGNUプロジェクトにより開発されているツールで、プログラムの他言語対応を補助する機能を持っています。

ソフトウェアの翻訳をやったことがある方は`.po`とか`.mo`なんて名前のファイルを見たことがあると思うのですが、アレを生成したりするツールがgettextです。

Kieletというライブラリを使うことで、プログラムが出力する文字列をこのgettextの対象に含めることができ翻訳作業をスムースに行えます。

#### Gloogle - Search through all public gleam packages

https://gloogle.run/

これは個人的に衝撃を受けたサイトで、Gleamの型名などを元に関数単位での検索を行なえるというものです。
ライブラリの検索として[Gleam Packages](https://packages.gleam.run/)というサイトが既に存在しています。

こちら自分も便利に使っているのですが、ここまで詳細かつ多くの情報を見られるサイトは無いと思います。

リリース当初は応答が遅く、タイムアウトすることもしばしばでしたが、今では応答もかなり速くなっているのでぜひ使ってみてください。
                                                         
### Even more great Gleam stuff

#### Gleam JSON 2.0 is faster using erlangs built-in JSON library

Gleam公式が提供しているJSONライブラリ`gleam_json`がv2.0.0に到達しました。
また、このリリースではErlangの組込みライブラリを用いることで速度が向上しました。

最近`gleam_json`を使う機会が増えているので速度の向上はかなりありがたいです。

#### Convert HTML into Lustre automatically.

https://lpil.github.io/html-lustre-converter/

HTMLをLustreのプログラムに変換してくれるサイトです。
[Flowbite](https://flowbite.com)などのTailwindのコンポーネントをLustre使う際にかなり使えます。


## issue12

### This week in Gleam

#### End-to-end types: full-stack web apps

https://www.youtube.com/watch?v=eVtkYQva0Ic

ベルリンで開かれたBEAM言語のカンファレンスでGleamのセッションがありました。
このセッションではGleamとLustreを使って音楽を作れるアプリのデモやElmアーキテクチャとErlang OTPのプロセスの類似性などハッとさせられる内容が多かったです。

あと`Lustre`って「ラスター」って読むんですね...ちゃんとした読み方が分かったのも良い収穫でした。

#### Interactive Lustre tutorial

https://gleamtours.com/lustre-tutorial/introduction/welcome-to-lustre/

対話的なLustreのチュートリアルサイトが公開されています。
Runボタンを押すと実際のページが見られるので気軽にLustreをいじれます。

[![Image from Gyazo](https://i.gyazo.com/66ebb795fca84a2d8bd28fd9a494e2c6.png)](https://gyazo.com/66ebb795fca84a2d8bd28fd9a494e2c6)
[![Image from Gyazo](https://i.gyazo.com/bad3dd753cf5b722c08dd2ec14ec14d6.png)](https://gyazo.com/bad3dd753cf5b722c08dd2ec14ec14d6)

#### Bravo - 2.3.0

https://github.com/Michael-Mark-Edu/bravo

ETSのGleam wrapperです。

ETSのWrapperとしては[carpenter](https://github.com/grottohub/carpenter)がありますが、
CarpenterはDict と同様に、オブジェクトを単純なキーと値のペアに制限している[^1]ため、柔軟性に欠けています。

bravoはテーブル内の全てのオブジェクトが同じ型でなければならないという事以外制約がありません。

またbravoはすべてのETS関数をライブラリに実装する予定らしく、期待したいところです。


### Even more great Gleam stuff

#### stdin 1.0.0 - provides a synchronous iterator for consuming stdin. 

https://github.com/Olian04/gleam-stdin

Gleamで標準入力を扱うためのライブラリです。
ありそうでなかったのが結構ビックリで、これ使えば競プロできるんじゃないかと思ったのでやってみたいですね。

#### This Gleam project prints iterations of the Dragon Curve stacked on top of each other. 

https://github.com/tcoard/gleam3d

Gleamで[ドラゴン曲線](https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%A9%E3%82%B4%E3%83%B3%E6%9B%B2%E7%B7%9A)を生成できるプロジェクトです。
リポジトリをcloneして`gleam run`すると`./data`にSTLファイルが出力されます。

#### Temporary - A package to work with temporary files and directories.

https://github.com/giacomocavalieri/temporary

Gleamで一時ファイルを扱うためのライブラリです。
一時ファイルを扱う機会は以外と多いのでありがたいですね。


## まとめ

今回も色々なライブラリが発表されたり更新されました。
興味深いプロダクトも増えてきて、知名度も増してきているのを感じているので自分も何か作ってみたいですね。











[^1]: 本来ETSは動的型付け言語なので、静的型付け言語であるGleamにとって実装がかなり難しい。
