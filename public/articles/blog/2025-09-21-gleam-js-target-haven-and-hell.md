---
title: "GleamのJSターゲットにおける天国と地獄"
description: "GleamでJS書くのは楽しいけど大変なところももちろんあるよ"
pubDate: "Sep 21 2025"
emoji: 🦊
tags: ["gleam", "javascript"]
draft: false
---

Gleam界隈ではErlangターゲットが主流[^1]なんですが、僕は主にJavaScript方面でのサポートに力を入れている。
理由はいくつかあるけれど、日本ではあまりErlangが使われていないこと、日本での普及を目指すならJavaScript方面のサポートを拡充した方が良いと考えているのが大きい。

そんな中でJavaScriptターゲットにおける楽しいところと大変なところが見えてきたので書いていきたいと思う。

## 天国

### JSにない構文が使える

これは個人的に大きいと感じていて、パイプライン演算子、ブロック構文、use構文の3つがあるというだけでGleamを使う動機にはなると個人的には思っている。

特にuse構文はこれだけで記事を書いているくらい面白い構文だと思っている。
use一つで`async/await`,
`try/catch`とその他諸々を兼ねているので、Gleamの構文のシンプルさを支える重要な構文だと思っている。

https://zenn.dev/comamoca/articles/gleam-use-syntax

### Result, Optionがある

effect-tsとかTSで`Result`を使う文化が広まりつつあるけれど、`try/catch`との両立が難しかったりすることもわりとあると思う。
Gleamだと例外処理の方法が`Result`しかないので、安全性が言語とコンパイラによって担保される。
また、`let assert`や`todo`等を使っていない純粋なGleamプログラムの場合、実行時例外が起こらないことが言語とコンパイラによって保証される。
ただ、外部のライブラリを使っている場合FFIでちゃんと例外処理しなければならないので、そこは気を付ける必要がある。

じゃあ意味ないじゃん、と言われそうだけど個人的にはそれでもやる意味はあると考えている。
理由としては、少なくともGleam上で実行時例外が起こるコードは書けないため、実行時例外が起こったらFFI経由のJSコードに原因があるから。

GleamをJSターゲットで使うと、JSのコードベースをあたかもRustのunsafeのように見れるので、より安全にJSのコードベースを扱えるのではないかと考えている。

### コンパイルが速い

GleamはTSのような複雑な型付けができない反面、型推論に時間が取られないため非常に高速にコンパイルが完了する。
Erlangターゲットだとrebarによるビルド工程が入るためそこがボトルネックになりがちなのだけど、JSの場合JSに変換する過程で処理が完了するため大抵の場合ほぼ一瞬で処理が終わる。

あまりにも速いので型チェックの代わりとして`gleam build`を実行しても良いくらいで、僕はもっぱら型チェック用途でも`gleam build`を使っている。
一応`gleam check`コマンドもあって、CIで弾くとかならそっちを使った方が良いと思うけど、手元でやるくらいならそれくらい雑でも動いてくれる。

### エラーメッセージが分かりやすい

Gleamはエラーメッセージの分かりやすいさに力を入れています。

型エラーなどはこんな感じで表示されます。

```
error: Type mismatch
  ┌─ /src/main.gleam:4:14
  │
4 │   io.println(148)
  │              ^^^

Expected type:

    String

Found type:

    Int
```

[playground](https://playground.gleam.run/#N4IgbgpgTgzglgewHYgFwEYA0IDGyAuES+aIcAtgA4JT4AEA5gDYQCG5A9IgDpK+UBXAEZ0AZkjrlWcJAAoAlHWC86dRADpKUGfiZz0AFgAc83gF9eIM0A==)

どこがどのようなエラーを期待していて、実際にはどんなエラーを入れたのか一目瞭然ですね。

このエラーの分かりやすさはLLMにも効いてきて、僕は実際簡単な型パズル程度のものなら全部claude
codeに任せてしまっています。 ただ、claude
code自体最新のGleam情報を追えていないので、いざ実際のコードを書かせると古い構文やライブラリを使ったコードを書いてきますが...

「マイナー言語だからVibe
Coding向いてないんじゃない？」という質問に関しては「こう見えて実は結構ポテンシャルがある」と答えています。

## 地獄

### GleamのJSターゲットにおける処理系問題

まず前提として以下の3点がある。

- Gleamが吐くJSはES6
- GleamはJSターゲットにおいてNode.js, Deno, Bunの3つの処理系をサポートしている
- Gleam側に処理系で分岐するような構文はない

---

Gleamには現在(2025/9/21)以下のフレームワークがある。

- [wisp](https://github.com/gleam-wisp/wisp)
- [glen](https://github.com/MystPi/glen)

これら2つのうち、glenについてはJSターゲットで動くフレームワークとなっている。
ただ、このフレームワークはffiにNode.js向けの実装が入っているため、現状Workers向けには動かない。

この問題はGleamのJSターゲットにおいてわりとよくある問題で、GleamにはErlangとJavaScriptで実装を切り替えられる構文`@target`が存在しているのに対して、JSの処理系毎に実装を切り替えるような構文が現状存在しない。

現在のコミュニティによるworkaroundでは、`globalThis`に`process`や`Deno`,
`Bun`が存在するかどうかで判定を行っている。

また、FFIを使って別のJSをimportする場合、ifの中に書くことはできないためトップレベルで行う必要がある。
しかし、FFIでNode.jsの組み込みモジュール(`node:fs`など)を読み込んでいる状態でブラウザ向けの処理を書こうとすると、当然Gleamの外でエラーが発生する。
先述したglenが動かない問題はこれが原因となっている。

それを回避するための方法として、FFI等処理系に依存したコードを別パッケージに切り出すという方法がある。
パッケージを分割することでコードの見通しが良くなるのと、パッケージをインストールしなければFFIがプロジェクトに混入しないため

一応`import()`を使えば不可能ではないが、パフォーマンスに不安がでるのとどのみちファイルを分割する必要があるためメリットは薄いと感じている。

### esbuild以外でのTree-Shakingに難がある

GleamのJSターゲット界隈ではbundleにesbuildを使うのが主流なのだけど、ご存知の通りesbuildはtree-shakingの性能がそこまで高くない。
本当はrollupなどが適任なのだけど、以前試していたら[plinth](https://github.com/CrowdHailer/plinth)のFFIの一部に`await import`を使用している箇所があったためエラーが発生してしまった。
これは先述したような複数処理系に対応するための`await import`だと推測しているのだけど、当然rollupはこれらのコードに対してtree-shakingの最適化をかけることが出来ない。

このようなライブラリが一定数存在するため、コミュニティ全体としてもrollupへの移行にあまり積極的ではないという雰囲気がある...

個人的には今作っているWebフレームワークのような設計にすれば回避できる問題だと思っているので、それで有効性を確認してからそっちの方も取り組んでみたい...

### runtimeファイル問題

これはAltJSの宿命だけれど、Gleamにおいても出力したJSコードにruntimeが付属する。
これはGleamコンパイラがruntimeに依存したコードを出力するためで、Hello,
world程度の規模のコードでも必須となってくる。

コード自体は`gleam export javascript-prelude`か以下のURLで見ることが出来る。
実際に読んでみると、プリミティブ型に対応するclassの定義とエラー処理、最低限の関数定義などが書かれている。

https://github.com/gleam-lang/gleam/blob/main/compiler-core/templates/prelude.mjs

これに追加して、一般的なGleamコードには[gleam_stdlib](https://github.com/gleam-lang/stdlib)のコードが乗っかるため、そこそこの分量になるはず。
ただ、Glemaは一般的な言語が組み込みで持っているような機能を標準ライブラリが持っており、標準ライブラリはただのコードなためesbuild程度のtree-shakeでも削ぎ落せるはず。

実際に手元で`Hello, world`をするコードを書いて、単一のJSにbundleしたもののファイルサイズを出してみる。

```sh
gleam new hello
cd hello
cat ./src/hello.gleam
import gleam/io

pub fn main() -> Nil {
  io.println("Hello from hello!")
}
```

```sh
gleam build --target=javascript
esbuild --bundle ./build/dev/javascript/hello/hello.mjs > out.js
ll ./out.js 
.rw-r--r-- coma users 948 B Mon Sep 22 03:26:23 2025  ./out.js
```

**948B!?**

1KBくらい余裕であると思っていたので想像より小さくて普通にびっくりしたけれど、これが言語機能が薄いということなのか...

ちなみにTypeScriptをコンパイルした結果はこれ。`console.log`しか含んでいないのでこれ以上は削れない限界となっている。

❯ ll hello.js .rw-r--r-- coma users 34 B Mon Sep 22 03:31:29 2025  hello.js

やはりruntimeコードが乗っかってくる重みは感じている...

ただ、他のAltJSと比較してもruntimeは薄いだろうし、アプリケーションの規模が大きくなると割合が減るので気にならなくなる...と思う。

### FFI書きづらい問題

GleamのJSターゲット向けのFFIは現状こんな感じで書く。

```js
export function add(a, b) {
  return a + b;
}
```

[^1]: 言語の由来を考えるとそれは本当にそうなんだよなと思ってます。
