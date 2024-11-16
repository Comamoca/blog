---
title: 'Gleamにマクロは必要なのか？'
description: 'Gleamとマクロに関する考察'
pubDate: 'Nov 15 2024'
emoji: '🦊'
tags: ["gleam"]
published: true
---

「Gleamにマクロは必要か？」

という議論はGleamコミュニティで度々話題になるテーマで、自分もGleamを好きな人間の一人なのでこれについて色々考えたりしている。

この記事はGleamにとってマクロは必要かどうかを個人的に考察してみた内容を書いてみたもの。
いわゆるポエムってやつです。

## 結論

先に結論を言ってしまうと、**Gleamにマクロは必要ない。またマクロに準ずる方法としてコード生成が良いと考える**。

根拠として、以下が上げられる。

- Gleamの精神性はRustよりGoに近いので、Goで広く用いられているコード生成の方がGleamに向いている。
- async/await, 例外処理、middleware、デコレータは`use`構文でカバー可能。
- コンパイラの実装や負担が増えるため。
- そもそもGleam自体がある種のマクロである。

## Gleamの精神性

GleamはよくRustに似ていると言われる。Gleamコンパイラ自体Rustで書かれていることもあってか、キーワードなどは非常に似通っている。

```gleam
// GleamのHello, world!
import gleam/io

pub fn main() {
  io.println("Hello, world!")
}
```

```rust
// RustのHello, world!
fn main() {
    println!("Hello, world!");
}
```

しかし、**Gleamの精神性はどちらかと言うとGoの方が似ている**。

と言うのも、Gleamは極力構文を少なくする方針の言語であり、Goもシンプルさを重視している言語なため。
また、並列処理に長けているという特徴も両者がより近しい存在である証左とも言える。

## use構文の活用

Gleamには`use`という面白い構文がある。

これは言わば**コールバックの中身を外に抉り出したかのような構文**で、Gleamではこの構文を使って

- 例外処理
- async/await
- middleware

などを表現している。

例えばこれを

```gleam
try(Ok(1), fn(x) { Ok(x + 1) })
```

```gleam
use x <- try(Ok(1))
Ok(x + 1)
```

こう書ける。

また`use`は連鎖できるので、例えば複数の`use`を積み重ねるように書ける。

```gleam
import gleam/io
import gleam/result.{try}

pub fn main() {
  use x <- try(Ok(1))
  use y <- try(Ok(2))
  Ok(x + y)
  |> io.debug
}
```

[Playground](https://playground.gleam.run/#N4IgbgpgTgzglgewHYgFwEYA0IDGyAuES+aIcAtgA4JT4AEA5gDYQCG5A9IgDpIXW1GLdhygQYAVyb4AdMHxQAngF9evShIBGdAGZI65VnCQAKAJR1gvOnQkwIdAB50APAFo6CxSYDyAaxN0MzNrW3s6RVcPL18AgCZg0P8TZwBqCJD9OgAfAD46RBkAEwhNCQZeZRBlIA==)

コード中に出てくる`Ok`はいわゆる`Result`型、型く言うならモナドというやつになる。
つまり、`use`を使うことでHaskellの`>>=`っぽい操作を実現できる。

ここからが面白いところで、useの実態はなんてことない**ただのコールバックになっている**。
つまり、最後の引数にコールバックを取る関数ならなんでも`use`が適用できるし、自身が書く関数を使う際にも同様のことが可能になる。

更に、`use`を使う側では受け取ったコールバックをいつ実行するかを実装者が決められる。
なのでPythonのデコレータもこれで実装できる。

```gleam
import gleam/io

pub fn main() {
  // デコレートする
  use <- decorate()
  sub()
}


// デコレータ
fn decorate(fun: fn () -> Nil) {
  io.println("before!")

  // 対象の関数を実行
  fun() 

  io.println("after!")
}

// デコレートする関数
fn sub() {
  io.print("This is sub!")
}
```

[Playground](https://playground.gleam.run/#N4IgbgpgTgzglgewHYgFwEYA0IDGyAuES+aIcAtgA4JT4AEA5gDYQCG5A9IgDpK+UBXAEZ0AZkjrlWcJAAoAlHWC86dATAh0APAFo6AEwh4orQgpV0Yw80gC+vXuINGapiLNECkqMRIV0dAD46ADk4JkVlCTpEADpKKBl8JjluECEIURoIAEI0+QtPOQLouISklNk01lFCKDyQEvs+JCcrIX8o1TLE4iqQABUACzgYGLH2hqaQWyA===)

`use`を使うことでこれらのパターンは全て対応できるので、これらの機能を実装するためにマクロを実装するメリットはないと考える。

## コンパイラの実装や負担が増える

ここまでは実装する必要性がない根拠について述べてきたけれど、ここからは明確なデメリットについて述べていく。

まず、よく使われているであろう準引用型のマクロを実装する方法を考えてみる。

このマクロを実装するには**なんらかの形でコンパイラに処理系を実装する必要がある**。
Gleamで言うならGleamコンパイラにGleamのサブセットを実装するのが妥当だと思う。[^1]

Gleamはいわゆるトランスパイル言語に分類されるので新たに処理系を実装するのは単純にコードベースと負担が増える。
またGleamは言語仕様がとても小さく、それ単体ではほぼ何もできないため標準ライブラリ相当のモジュールも用意する必要がある。

最近はQuickJSといった埋め込み可能なJavaScript
Runtimeがあるためこれらを使う方法もあるだろうが、前述したようにメリットが薄いなかこれらの機能を追加するのは長期に渡って負担になると考える。

## そもそもGleam自体がマクロである

そもそもマクロとは**プログラムからプログラムを生成する言語機能である**。
そしてGleamはGleamプログラムからErlang/JSプログラムを生成する。

つまり、Erlang/JSの立場からGleamを見ると、Gleamは**Gleamプログラムから別言語のプログラムを生成するある種のマクロである**という解釈が可能になる。

そのGleamにマクロを追加するということは**マクロ生成マクロを実装することに等しく**、単純にプログラムの複雑化を促進してしまう。

実は自分はこれに気付くまでマクロ推進派だった。
けれどこの事実に気付いてからはマクロ実装に対して反対の立場を取っている。
また、マクロの代替として以下の方法を考えている。

## 自分が考えるマクロに変わるソリューション

自分はGleamにマクロを実装する代わりに、**Goのようなコード解析・生成機能**を整えるべきだと考えている。

この考えに至ったきっかけのプロジェクトがある。`squirrel`というライブラリで、これは`sqlx`のようにSQLを構文解析して**Gleamのソースコードを生成する**。

生成されたソースコードはもちろん型が付いているので、生成したコードを使う際はLSPとコンパイラによる支援が得られる。
このライブラリが登場した時はコミュニティがかなり盛り上がり、自身もこのアプローチに将来性があると確信したのを覚えている。

https://hexdocs.pm/squirrel/

Gleamでコード生成する方法として、以前は暖かみのある文字列連結が多用されていた。
けれど最近はGleamでデータ構造をしっかりと作り、型安全にコードを生成するライブラリが作られている。

この記事を書く数日前にもGleamコードでGleamを生成するライブラリが公開されていた。

https://hexdocs.pm/gleamgen/index.html

自分はこれらのアプローチを更に一歩進めて、**Gleamプログラムのパースとコード生成を共通のAST**で行なえるようにするべきだと考えている。

Gleamのパーサとして、純粋なGleamで実装された`glance`というライブラリがある。

https://hexdocs.pm/glance/

しかしこのライブラリの逆―ASTからGleamプログラムを実装するライブラリは現時点(11/15)で確認できていない。
もしglanceが生成するASTをGleamプログラムに戻すライブラリがあったらどうだろう。

**既存のGleamプログラムから任意の操作を行なったGleamプログラムを出力**できるようになる。
つまりあとライブラリがひとつあれば、プログラムからプログラムを生成できるプログラム―つまり**事実上のマクロ**を実現できる。

このアプローチは実装コストが少なく、純粋なGleamで実装すれば両方のターゲットで使えるためマクロの機能を実現する方法としてかなり良いと考えている。

また、これを現実にするためにglance
ASTからGleamプログラムを生成するライブラリを実装しようとも考えている。
幸い`gleamgen`の前例があるので`use`を使ってスコープを表現するAPIのアイデアなどを拝借しながら実装していこうと考えている。

[^1]: この形式で実装しているNimにはサブセットであるNimScriptが実装されている。
