---
title: '3/22 Gleam Weekly'
description: 'Gleam Weeklyの内容を解説していきます。'
pubDate: 'Mar 22 2024'
emoji: '🦊'
---

[Gleam Weekly](https://gleamweekly.com)というGleamで起った出来事を毎週まとめて送ってくれるメールサービス(無料)です。

そのメールの内容をGleamlins[^1]である自分が解説してみようという試みです。Weeklyとあるように毎週やる予定です。

## This week in Gleam

### Gleam version 1

https://gleam.run/news/gleam-version-1/

今週最も大きなニュースはまちがいなくこれ。安定版がリリースされたことで今後もっとGleamコミュニティが活性化することを願う。

### n-sided-lucy

https://0xca551e.github.io/n-sided-lucy/

オリジナルのLucy[^2]を作れるWebアプリケーション。LustreというGleamでSPAを作れるフレームワークを使っていて、GleamでWebアプリを作るサンプルとして参考になる。

### pprint 1.0

https://github.com/MystPi/pprint

Gleamで整形表示(pretty print)をするためのライブラリがv1に到達した。
今のところGleamでデバッグするのは`io.debug()`一択なので、オブジェクトの中身を見やすくしてくれるライブラリはありがたい。

### p5js_gleam

https://github.com/Acepie/p5js_gleam

A demo showcasing how to create and use bindings to create a little animation site with p5js.

Gleamで[p5js](https://p5js.jp)を操作するためのバインディングとデモ。
p5jsを使うとクリエイティブなWebサイトを構築できるため、Gleamのクリエイティブ分野の道が切り開かれたとも言えそう。

## Even more great Gleam stuff

### A lean XML builder for Gleam

https://github.com/tovedetered/xmleam

GleamでXMLを構築できるライブラり。RSSライブラリとか作るのに使えそう。

### Binary Data in Gleam: Implementing The RCON Protocol

https://dev.to/bitcrshr/binary-data-in-gleam-implementing-the-rcon-protocol-2684

RCONプロトコル[^3]をGleamでやってみると言う記事。
ライブラリも公開しているようで、これを使えばRCONプロトコルに対応しているサーバーに対してGleamから操作を行うことが出来る。
自分はマイクラみたいなゲームは基本やらないのであまりユースケースは思い付かないのだけど、ここで紹介されているということはそれなりに需要があるのだろうなぁと思ってる。

### Gleam for Impatient Devs

https://www.youtube.com/watch?v=NyKIvWvr9kw

サクッとGleamの事を知りたい人のために9分でGleamついて紹介したビデオが投稿されている。
英語だけれどよくまとまっているので、動画形式で知りたい人はこれがオススメ。

### Types for HTTP headers Project

https://github.com/LilyRose2798/typed_headers

GleamでHTTPを扱う際に静的に型付けされたヘッダーを使えるようにするためのライブラリ。

### Simple Programming Languages

https://ryanbrewer.dev/posts/simple-programming-languages.html

Go、Gleam、Cなどのシンプルな言語をあげてそれぞれの「単純性」を理論化し、将来のプログラミング言語設計のための原則を考案している記事。

記事内では、単純な言語はプログラミング言語の機能ではなく目の前の問題に集中しやすくし、コンパイルが速いため試行錯誤や速くなり、人間が理解しやすいコードをもたらすといったメリットがあげられている。

## 余談

初めてこういった試みをしてみたけど、Gleamのみならずプログラミングの広範な情報が集まってくるためインプットとアウトプットの両方の観点から結構良さそうだと感じた。来週もやってみたい。

[^1]: Gleam使ってる人のことをそう言うらしいです。
[^2]: Gleamのマスコット。以前はもっと幾何学的なキャラデザをしていました。
[^3]: セルフホスト出来るゲームサーバーにおいて、リモートで接続するためのプロトコルとして使われているらしい。
