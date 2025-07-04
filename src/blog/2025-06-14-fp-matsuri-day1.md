---
title: '関数型まつり Day1'
description: '関数型まつり一日目に行ってきた。'
pubDate: 'Jun 14 2025'
emoji: 🦊
tags: ["event", "fp-matsuri"]
draft: false
---

関数型まつりの一日目があった。

地上に出る区間が見たいという理由で東西線使って行った。あと普通に遅刻した。すみません...

#### Elixir で IoT 開発、 Nerves なら簡単にできる！？

ElixirでIoTをするにはどういう技術を使うのか、実際どうなのか？という内容だった。

Nerves自体は知っていたのだけど、クラウドサービスがあったりPhoenixが動いちゃうのは知らなかったので驚いた。

IoTとErlang VMの相性はわりと良いと思うので、自分の方でも色々探っていきたい。

## Rust世界の二つのモナド──Rust でも do 式をしてプログラムを直感的に記述する件について

ゴリゴリモナドと圏論の話が出てきてめちゃくちゃ難しかったなと思った。圏論難しい...
それでもdo記法とモナドの関係性やどうして嬉しいのか、と言った内容が語られていて吸収できる部分もあった。

やっぱりHaskellやる必要があるなと感じたセッションだった。

## 関数型言語を採用し、維持し、継続する

Elixir x
Elmとかいう尖りまくったスタックで開発を行なっている方による「現実」の話だった。

実はこの時ATMに行っていて[^1]前半は聞けてないのだけれど、「非メインストリームを採用するには狂気が必要」という言葉に「仕事で関数型言語を使うなら？」というボードにEmacs
Lispと書いてしまった事を思いだし刺さっていた。 そこはGleamだろうと。

もっと狂気を纏えるよう修行したいと思えるセッションだった。

## 「ElixirでIoT!!」のこれまでとこれから

ElixirでIoTするならどんな感じになるの？と言った問いに答えるようなセッションだった。

Elixirのエコシステムは既に必要なものは揃っている段階で、それらのエコシステムを使ってIoTを開発できる強みなどを解説していた。
特にElixirなどのErlnag VMは別のErlnag
VMノード上の関数を呼び出すコストが結構低いので、それを活用してクラウド上のノードに重い処理をさせようというのは筋が良いなと思った。
類似の技術としてFLAMEというものがあるのだけど、セッションで紹介されていたGiocciとそれは何が違うのか質問しそびれちゃったので別の機会に質問したい。

Zenohは初耳だったので色々調べてみようと思った。

## Effectの双対、Coeffect

Jellyの人だ！と個人的にそういうイメージを持っているゆきくらげさんのセッションを見た。
懇親会で挨拶しそびれたのかなり惜しい...

セッションの内容はEffectシステムをモナドを交えつつCoeffectについて解説するものだった。

このセッションで初めてCoeffectについて知ったのでChatGPTに質問しながらセッションを聞いたのだけど、自身の圏論力不足で完全理解とはいかなかったので勉強していきたい。

みんな圏論モナモナしてて格の違いを感じた...

## continuations: continued and to be continued

継続は力なり！

僕が「NixでEmacs管理するとnativecompが効いて爆速になるんですよ〜」って話をした方が登壇されていてビックリした。
セッションでは継続をモナドなど関数型の観点から解説するもので興味深かった。

継続はSchemeのcall/ccのイメージが強かったので初っ端からScalaとかの話が出てきて驚いたけど、後でcall/ccも出てきてホッとした。
他の関数型言語にも継続の概念があるんだって事を知れたので良かったなと。

## What I have learned from 15 years of functional programming

最後のセッションは関数型ドメインモデルの著者Scott Wlaschinさんによる「What I
have learned from 15 years of functional programming」だった。

関数型プログラミングのあらゆる要素をひとつのセッションで説明していて、こんなに綺麗に説明できるんだ...と関心してしまった。
特に鉄道指向プログラミングで例外が連結された時は思わず声が出てしまった。

## 懇親会

懇親会行く場合は事前にdookeeperで申し込む必要があるのだけど、運営さんのご好意で現地で支払いする事で参加できた。
本当にありがとうございました！お陰で楽しい懇親会を過ごせました。

懇親会でshunsockさんと合流できたので良かった。

そのあとお開きになってしまったので、2次会に行った。

PHPとキャッシュの話になったりして、PHP書いたことないけど大変なんだなぁと思った。
