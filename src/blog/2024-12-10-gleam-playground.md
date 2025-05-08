---
title: 'Gleamには公式のPlaygroundがある'
description: '実は最近新しくリリースされたって話'
pubDate: 'Dec 10 2024'
emoji: 🦊
tags: []
draft: false
---

この記事は[Gleam Advent Calendar 2024](https://qiita.com/advent-calendar/2024/gleam)10日目の記事です。

最近ではブラウザ上で手軽にスニペットが書ける環境、いわゆるPlaygroundがよく公式/非公式で提供されています。

Gleamでは以前から非公式のPlaygroundが提供されていましたが、これはコンパイラが非常に古く、`use`など新しく入った言語機能が使えないものでした。

ですが今年、公式でPlaygroundのリポジトリが作成され新しい構文を利用したGleamコードを試せるようになりました。

という訳で早速試してみましょう。

https://playground.gleam.run/

Gleam Playgroundにアクセスするとこんな画面になるはずです。

![](/img/2024-12-10-gleam-playground.webp)

では、`"Hello, Joe!"`の箇所を`"Hello, Gleam!"`と書き換えてみてください。

書き換え終わったら右側に`Hello, Gleam!`と表示されているはずです。

次は簡単なフィボナッチ関数を書いてみましょう。
以下の関数をPlaygroundに追記してみてください。

```gleam
fn fib(n) {
  case n < 2 {
    True -> n 
	False -> fib(n-1) + fib(n-2)
  }
}
```

Gleam Playgroundでは、コードを編集する度にリアルタイムにコンパイルが走ります。
なので、もしコピペせず写経した場合途中でエラーが起きます。

ですが、コードを書き終わったらエラーは消えるはずです。
書き終わったら、先程の`io.println("Hello, Gleam!")`の下に以下のコードを追加してください。

```gleam
fib(30)
|> io.debug
```

右側にこんな感じの表示が出てきたら成功です。

```
Hello, Gleam!
832040
```

最後に、画面右上にある**Share Code**というボタンを押してみてください。
するとクリップボードに共有可能なリンクがコピーされます。

サンプルとしてここまでのコードを共有リンクにしてみたので、試しにクリックしてみて下さい。

[Playground](https://playground.gleam.run/#N4IgbgpgTgzglgewHYgFwEYA0IDGyAuES+aIcAtgA4JT4AEA5gDYQCG5A9IgDpK+UBXAEZ0AZkjrlWcJAAoAlHWC86dRADpKUGfiZzuIABIQmTBJjoBxFuwCEB+SrpPRcIbIDMABkcS6AHwA+NQR1ABMIIQEGXgBfXl5xMTdZJEVlPxxWGAg6CQAeOgAmJSdVABUoAVyAWmC+P1UAMVYmHLo65PckGvRFAGou1Jqi31V4pFiQWKA)

このリンクを使えば、Twitterなどで自身の書いたコードを共有できます。

## Gleam Playgroundの仕組み

さて、ここまでGleam
Playgroundを軽く使ってみましたが、どういう仕組みで動いているのか気になった方もいると思います。
なので仕組みについても簡単に説明してみたいと思います。

Gleamのコンパイラは公式だとWindowsとLinuxとMacに対応しています。
また、wasmにも対応していてwasm_bindgenによって生成されたJavaScriptコードが付属しています。

このコンパイラを用いてGleamコードをJavaScriptに変換、worker内で実行しています。
Gleam PlaygroundではGleam標準ライブラリが使えますが、
Gleamコンパイラには当然付属していないのでPlayground側でコンパイル済みの標準ライブラリを読み込む処理を行なっています。

という訳でGleam Playgroundについて簡単に紹介しました。
ブラウザで手軽にGleamを体験できるので、もしGleamに興味がある方を見かけたら教えてあげてみて下さい！
