---
title: 'issue9-10 Gleam Weekly'
description: 'Gleam Weeklyの内容を勝手に解説していきます。'
pubDate: 'May 30 2024'
emoji: '🦊'
---

早いものでもう10回目ですね。
週一だと分量が少ないと感じ始めたので、今回から隔週[^1]で書いていきたいと思います。

## issue9
                                                                                       
### This week in Gleam

#### A Practical Use Case for Function Capture in Gleam

https://gleaming.dev/articles/function-capture-in-gleam

Gleamの記事を投稿している[gleaming](gleaming.dev)で関数キャプチャの解説記事が投稿されました。
関数キャプチャとは、一言で言えば関数をカリー化するための構文です。これもまたZennで詳しく解説したいと思います。

```rust
let add = fn (a, b) { a + b }
let add_1 = add(_, 1)

io.debug(add_1(2)) // => 3
```

### chrobot: v1.0

Chrome devtool protcol を使ってChromeの操作を自動化するライブラリchrobotがv1.0になりました。
Playwrightみたいに自動テストを行なったり、スクレイピングで使えそうで期待してます。

### Even more great Gleam stuff

#### Stacky: BEAM stack trace in Gleam. 

https://github.com/inoas/stacky

Erlangバックエンドでスタックトレースを出力するライブラリです。
Erlangはエラーメッセージが分かりずらくデバッグで苦労する場面も多いのでありがたいです。

## issue10

### This week in Gleam

#### Gleam on NPM

https://github.com/ghivert/gleam-lang-npm

npmでGleamコンパイラを使えるようにしたnpmパッケージです。主にJavaScriptターゲットのCIを想定しているらしいです。


#### Grille-Pain - A Toast component for Gleam

https://github.com/ghivert/grille-pain

Gleamの通知トーストライブラリです。
Lustreを中心としたGleamのフロントエンドが着実に成長しているのを感じます。

### Even more great Gleam stuff

#### Erlang/OTP 27.0 Release 

https://www.erlang.org/news/170

Erlang/OTP 27がリリースされました。
このバージョンはJITが改善されていたりとGleamにも良い影響がある変更があるので嬉しいです。

[^1]: 2週分を一つの記事で書いていきます。
