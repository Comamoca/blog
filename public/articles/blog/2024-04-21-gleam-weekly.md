---
title: issue5 Gleam Weekly
description: Gleam Weeklyの内容を勝手に解説していきます。
pubDate: Apr 21 2024
tag:
  - gleamweekly
emoji: 🦊
draft: false
---

投稿をサボっていたせいで詰っているので連続で投稿します。

## This week in Gleam

### Gleam version v1.1

https://gleam.run/news/gleam-v1.1/

Gleamのv1.1がリリースされました！

- JavaScriptターゲットのBunサポート
- JavaScriptターゲットのListの最適化
- rebarのサポート

などが追加されました。個人的にはBunサポートが一番ビックリしていて、これでGleamを使ったクロスランタイムに動くライブラリの実現が近づいたと感じています。

## Gleam Trick: Resultify

https://blog.nytsoi.net/2024/04/16/resultify

GleamからJavaScriptの外部関数を呼びだす際に発生したエラーを上手くハンドリングする小さなスニペットを紹介している記事です。
自分はGleam&JSの活路を模索しているので結構参考になりました。

## Cleam

https://github.com/darky/cleam

Gleamから未使用のコードを検出し、自動的に削除するツールです。
構文解析にはGleamの作者さんが開発しているGleamパーサー[glance](https://github.com/lpil/glance)を使用しています。
つまり、glanceを使えばCleamみたいなツールを作ることができます。

これについても試してみたいですね...

### Gling: 1.0

https://codeberg.org/Pi-Cla/gling

すべての単語を`gl`で始まるようにするジョークプログラムです。

![](https://r2.comamoca.dev/gling.webp)

## Even more great Gleam stuff

### Telega: Telegram bot

https://github.com/bondiano/telega

TelegramのBotを開発するためのフレームワークTelegaがアップデートされました。
内部ではWispを使用しています。

### term_size: retrieve the terminal’s size

https://hexdocs.pm/term_size/

**全てのターゲットに対応している**ターミナルの大きさを取得するライブラリです。
GleamでTUIを作る際に役に立ちそうです。

## まとめ

今回はライブラリのGleamのバージョンアップなど色々なプログラムがアップデートしました。
特にGleamはつい最近v1に到達したばかりなのにもうv1.1に到達していて、成長が著しいと感じます。
この調子できたるv2に到達して欲しいですね。
