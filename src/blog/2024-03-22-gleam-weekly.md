---
title: 3/22 Gleam Weekly
description: Gleam Weeklyの内容を解説していきます。
pubDate: Mar 22 2024
emoji: 🦊
draft: false
---

[Gleam Weekly](https://gleamweekly.com)という Gleam
で起った出来事を毎週まとめて送ってくれるメールサービス(無料)です。

そのメールの内容を Gleamlins[^1]である自分が解説してみようという試みです。Weekly
とあるように毎週やる予定です。

## This week in Gleam

### Gleam version 1

https://gleam.run/news/gleam-version-1/

今週最も大きなニュースはまちがいなくこれ。安定版がリリースされたことで今後もっと
Gleam コミュニティが活性化することを願う。

### n-sided-lucy

https://0xca551e.github.io/n-sided-lucy/

オリジナルの Lucy[^2]を作れる Web アプリケーション。Lustre という Gleam で SPA
を作れるフレームワークを使っていて、Gleam で Web
アプリを作るサンプルとして参考になる。

### pprint 1.0

https://github.com/MystPi/pprint

Gleam で整形表示(pretty print)をするためのライブラリが v1 に到達した。
今のところ Gleam
でデバッグするのは`io.debug()`一択なので、オブジェクトの中身を見やすくしてくれるライブラリはありがたい。

### p5js_gleam

https://github.com/Acepie/p5js_gleam

Gleam で[p5js](https://p5js.jp)を操作するためのバインディングとデモ。 p5js
を使うとクリエイティブな Web サイトを構築できるため、Gleam
のクリエイティブ分野の道が切り開かれたとも言えそう。

## Even more great Gleam stuff

### A lean XML builder for Gleam

https://github.com/tovedetered/xmleam

Gleam で XML を構築できるライブラり。RSS ライブラリとか作るのに使えそう。

### Binary Data in Gleam: Implementing The RCON Protocol

https://dev.to/bitcrshr/binary-data-in-gleam-implementing-the-rcon-protocol-2684

RCON プロトコル[^3]を Gleam でやってみると言う記事。
ライブラリも公開しているようで、これを使えば RCON
プロトコルに対応しているサーバーに対して Gleam から操作を行うことが出来る。
自分はマイクラみたいなゲームは基本やらないのであまりユースケースは思い付かないのだけど、ここで紹介されているということはそれなりに需要があるのだろうなぁと思ってる。

### Gleam for Impatient Devs

https://www.youtube.com/watch?v=NyKIvWvr9kw

サクッと Gleam の事を知りたい人のために 9 分で Gleam
ついて紹介したビデオが投稿されている。
英語だけれどよくまとまっているので、動画形式で知りたい人はこれがオススメ。

### Types for HTTP headers Project

https://github.com/LilyRose2798/typed_headers

Gleam で HTTP
を扱う際に静的に型付けされたヘッダーを使えるようにするためのライブラリ。

### Simple Programming Languages

https://ryanbrewer.dev/posts/simple-programming-languages.html

Go、Gleam、C
などのシンプルな言語をあげてそれぞれの「単純性」を理論化し、将来のプログラミング言語設計のための原則を考案している記事。

記事内では、単純な言語はプログラミング言語の機能ではなく目の前の問題に集中しやすくし、コンパイルが速いため試行錯誤や速くなり、人間が理解しやすいコードをもたらすといったメリットがあげられている。

## 余談

初めてこういった試みをしてみたけど、Gleam
のみならずプログラミングの広範な情報が集まってくるためインプットとアウトプットの両方の観点から結構良さそうだと感じた。来週もやってみたい。

[^1]: Gleam 使ってる人のことをそう言うらしいです。

[^2]: Gleam のマスコット。以前はもっと幾何学的なキャラデザをしていました。

[^3]: セルフホスト出来るゲームサーバーにおいて、リモートで接続するためのプロトコルとして使われているらしい。
