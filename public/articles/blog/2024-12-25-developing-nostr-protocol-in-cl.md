---
title: "Common LispでNostrプロトコルを実装している話"
description: "実装中に詰まったこととか"
pubDate: "Dec 25 2024"
emoji: 🦊
tags: ["commonlisp", "nostr"]
draft: false
---

最近はCommon LispでNostrプロトコルを実装している。
まだ未完成だけど、結構知見も得られたのでここらで一旦記事の形にしてみようと思っている。

## JSONパーサにはshashtが良さそう

https://github.com/yitzchak/shasht

JSONパーサに何を使おうか結構迷ったのだけど、shashtを採用した。

理由は、read/write両方のベンチマークにおいて良好な結果を残しているから。

Nostrプロトコルでは両方使うことになるから、双方のスコアが優れているshashtを使うべきと判断した。

shashtはこんな感じで使える。

```lisp
(gethash "msg" (shasht:read-json "{\"msg\": \"hello\"}"))
;; => "hello"
```

```lisp
(let* ((table (cl:make-hash-table)))
  (setf (cl:gethash "msg" table) "Hello")
  (shasht:write-json table nil)
)

;; "{
;;   \"msg\": \"Hello\"
;; }"
```

## 暗号処理にはironcladが良さそう

sha256の計算にはironcladを採用した。
理由としてはこれは一番メジャーそうだったのと、sha256とsecp256k1の両方をサポートしているので、
新たにライブラリを導入する手間が省けそうというのがある。

ただ、日本語情報が皆無なのでChatGPTなりGitHubなりを頼って書く必要があった。

自分が使ったsha256とsecp256k1の方法だけでもここにメモとして残していきたい。

sha256の例。 こちらは関数として作っていたのでそのまま載せてみる。

```lisp
(defun string-to-sha256 (text)
  "文字列をsha256にする。内部の文字列はutf-8として扱われる。"
		  (let* ((input-string text)
			 (utf8-bytes (babel:string-to-octets input-string :encoding :utf-8))
			 (hash (crypto:digest-sequence :sha256 utf8-bytes)))
		    (crypto:byte-array-to-hex-string hash)))
```

secp256k1の例。
一応動くには動くけど、他のNostrクライアントが生成する署名と異なる結果を出すので**署名結果が誤っている可能性が極めて高い。**
利用は自己責任で。

```lisp
(let* ((message (babel:string-to-octets "メッセージ"))
       (pub-key-bytes (babel:string-to-octets "公開鍵"))
       (sec-key-bytes (babel:string-to-octets "秘密鍵"))
       (pub-key (make-instance 'ironclad:secp256k1-public-key :y pub-key-bytes))
       (sec-key (make-instance 'ironclad:secp256k1-private-key :x sec-key-bytes))
       (sign (ironclad:sign-message sec-key message)))
  (bytes-to-hex-string sign)
)
```

## feederの読み込み方が分からない

RSSのパーサに[feeder](https://github.com/shinmera/feeder)というものを使おうとしたのだけど、
system名がfeederで内部で公開しているpackage名が`org.shirakumo.feeder`となっている。

`(asdf:load-system :feeder)`とすればREPLでこそ読み込めるものの、asdfでパッケージをビルドしようとするとエラーになる。[^1]

読み込めないという点以外においては使いやすくて便利なライブラリなのでものすごく惜しい...

一応この問題は自分のサイトのRSSにJSONを導入することによって解決した。
ただ他のサイトに応用が効くとは思えないので、自分でパースライブラリを書くか読み込めるようにするかして解決するようにしたい。

## bech32のライブラリを書いている

一応エンコード部分は書けている。

bech32は主にビットコインで使われているエンコード方法。
Nostrではnpubとかnsecとかそういうのを表現するために用いられている。

Common
Lispにも同等のライブラリはないか探したけど、見当たらなかったので書いている。
これに関しはリファレンス実装があるのでそこまで困らなかった。

https://github.com/sipa/bech32/blob/master/ref/python/segwit_addr.py

デコードの箇所も書いて完全なものにしたいのと、信頼性を高めるためにテストをちゃんと書いていきたい。

あと、この処理は現状NostrにRSSイベントを投稿するスクリプトにそのまま書いているのだけど、
それなりに汎用性のある処理なので後々ライブラリとして切り出したい。

## まとめ

とまぁこんな感じで色々知見が得られた。 Common
LispかつNostrというマイナーとマイナーのかけ合わせみたいなことをやっているので情報不足に結構苦しんでる。[^1]

これからも何か分かったら色々書いていきたい。

[^1]: sbclのライブラリ管理にNixを使っているのでそれが原因の可能性もあるかもしれない。

[^2]: それが良いのだけども。
