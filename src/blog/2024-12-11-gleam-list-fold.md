---
title: 'gleam/listのfoldは便利'
description: 'gleam/listのfoldの使い方について'
pubDate: 'Dec 11 2024'
emoji: 🦊
tags: []
draft: false
---

この記事は[Gleam Advent Calendar 2024](https://qiita.com/advent-calendar/2024/gleam)11日目の記事です。

Gleam標準ライブラリのlistモジュール(`gleam/list`)には`fold`という関数があります。

https://hexdocs.pm/gleam_stdlib/gleam/list.html#fold

この関数が想像以上に便利だったので紹介します。

## foldとは

foldとは、リストの折り畳みをする関数です。
fold自体はGleam以外の言語にも提供さえていて、JSだと`reduce`メソッドでその機能が使えます。

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

foldを使うと、「リストの処理中に同一の値に参照する」みたいなコードをスッキリと表現できます。
手続き型言語で`for`と変数を用いて実装するような処理が該当すると思います。

## 実際の活用例

最近僕が書いたコードだと、「プレースホルダ`$N`が含まれているテンプレート文字列`tmpl`に対して、リストの値を順番にそのプレースホルダに適用させる」
言わばテンプレートエンジン的な動作を再現するものがあります。

```gleam
import gleam/io
import gleam/list
import gleam/int
import gleam/string

pub fn main() {
  let tmpl = "import gleam/io

pub fn $1() {
  let $2 = \"$3 and $4\"
  
  io.$5($2)
}"
  let editors = ["main", "msg", "vim", "emacs", "println"]

  list.zip(editors, list.range(1, list.length(editors)))
  |> list.fold(tmpl, fn (tmpl, editor: #(String, Int)) {
    let each = string.concat(["$", int.to_string(editor.1)])
    string.replace(tmpl, each:, with: editor.0)
  })
  |> io.println
}
```

[Playground](https://playground.gleam.run/#N4IgbgpgTgzglgewHYgFwEYA0IDGyAuES+aIcAtgA4JT4AEA5gDYQCG5A9IgDpIXW1GLdhyZwY+Xvxr1mbTnGJSqMofI4Soihr16UArgCM6AMyR1yrRQAoAlHWC86dFvXxUmdALx1uZFYJyIjxIekam5gAk6HYOTi4Q9JEATN6+3H6RAMx0rEgAJnSRACwZfvHxiAB0kQCs1im2vAC+5eYJ9BD5cPg0MGkA2n6Win6YviDkMDog435gFGMTEJY4MEt+lFrETKEgALq67WISVQBecJTWXT194yf4VVB5DBDWWC7ijyxIDPgAFtdur1YLYwfEAD4APk+pxMCCY+Ws7koTHGZjoyI84xuINQdAAxNYAMr4bYMcYASWIYLi7WcrjobBw/zSmm0VTwSBwrHw1iGIEiS0Uj16AH12b8gbcoFV0LZ9k16XRJQwnhBUawcG8UWimVr/qhxgB3HqGpnAmhVAAMSuczTtdGhdGqWxFuxaIGaQA)

`zip`はおなじみの通り2つのリストを1つのタプルのリストにまとめる関数です。
これにより、JSの`map`メソッドにおけるindex引数相当の処理が行なえます。

このスニペットでは明示的な型付けをほぼ行なっていませんが、唯一`editor`変数のみ行なっています。
これはTupleでインデックスアクセスを行なう際にGleamコンパイラが型を検証するためです。

実行すると以下のようなGleamとして有効なコードが生成されます。

```gleam
import gleam/io

pub fn main() {
  let msg = "vim and emacs"
  
  io.println(msg)
}
```

[Playground](https://playground.gleam.run/#N4IgbgpgTgzglgewHYgFwEYA0IDGyAuES+aIcAtgA4JT4AEA5gDYQCG5A9IgDpK+UBXAEZ0AZkjrlWcJAAoAlHWC86dFvXIwGdALx1u4CnVZIAJnQhScMAyv0S6iAHSUoM/EzmaG83gF8QPyA===)

![](/images/2024-12-11-gleam-fold.png)

なお、`fold`関数は`gleam/list`のみならず先日紹介した`gleam/yielder`モジュールにも実装されています。
こちらは遅延評価されるため、大きなリストを扱う処理に適しています。

https://comamoca.dev/blog/2024-12-09-gleam-iterator-update/

<br>

https://hexdocs.pm/gleam_yielder/gleam/yielder.html#fold

という訳で、foldは便利という話でした。
