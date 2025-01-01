---
title: 'cl-arrowsは使わない方が良い話'
description: 'cl-arrowsはライセンスが明示されていないので、代わりにarrowsを使おう'
pubDate: 'Jan 1 2025'
emoji: 🦊
tags: ["commonlisp"]
draft: false
---

> ライセンスが明示されていないのは、どんなライセンスよりも厳しいライセンスだ。

_[Ruby 1.9.2リリースとWEBrick脆弱性問題の顛末 | 西尾泰和のはてなダイアリー](https://nishiohirokazu.hatenadiary.org/entry/20100819/1282200581)_

あんまりこの話を見かけない気がするので覚え書きです。
あとタイトルと概要が内容の全てです。

## cl-arrowsの概要

cl-arrowsというライブラリについて簡単に説明します。

cl-arrowsはCommon Lispで**Clojureのthreading macro**を実装したライブラリです。
threading macroは以下のようにGleamとかElixir
likeなパイプラインが使えるマクロになります。

```clj
(import 'java.net.URI)

(let [area-code 130000]
  ;; -> の部分がthreading macro
  (-> (URI. "https" "www.jma.go.jp" (format "/bosai/forecast/data/overview_forecast/%d.json" area-code) nil)
      (str)
      (slurp)
      (json/parse-string true)
      :publishingOffice)) ;; => "気象庁"
```

本来ネストしたりletで書いていく箇所をただ実行したい順序で書けるので、書きやすくスッキリとしたコードになります。

## cl-arrowsにはライセンスがない

そんなこんなで便利なcl-arrowsですが、なんと**ライブラリがありません**。
GitHubのLicenseで表示されてないだけかと思いファイルも確認しましたがありません。

https://github.com/nightfly19/cl-arrows/issues/5

このissueを見ると分かりますが、cl-arrowsはライセンスがないライブラリになります。

ライセンスがないライブラリを使用するリスクについては以下の記事が詳しいです。

https://qiita.com/Tatamo/items/ae7bf4878abcf0584291

上記の記事にも該当記事のリンクがありますが、Ruby1.9.2ではライセンスがないプログラムによって実際に問題が発生しました。

## 代わりにarrowsを使おう

という訳でcl-arrowの代わりとして[arrows](https://github.com/Harleqin/arrows)を使っていきましょう。

基本的な機能はcl-arrowsを踏襲しているので、移行もそこまで手間ではないと思います。

ちなみにこちらのライブラリのライセンスはパブリックライセンス(CC0)になります。

---

cl-arrowsはASDFのサンプルとして使われていたりなにかと目にする機会も多いのですが、
抱えているリスクを聞く機会はあれど[^1]その内容を書いている記事はなかった気がする[^2]のでこの機会に文章にしてみました。

元日からちょっと重い内容を書いてしまいましたが、今年も良い年にしていきたいです。

[^1]: この問題はCommon Lispではわりとメジャーな話だそうです。

[^2]: あったらすみません...
