---
title: gleam/iteratorが非推奨になった話
description: 'gleam/iteratorはv0.44.0から非推奨になりました。'
pubDate: 'Dec 9 2024'
emoji: 🦊
tags: []
draft: false
---

この記事は[Gleamアドベントカレンダー](https://qiita.com/advent-calendar/2024/gleam)9日目の記事です。

久しぶりのGleamネタです。

最近またGleamを書いているのですが、標準ライブラリのドキュメントを見ていたらあることに気が付きました。

![](/img/2024-12-09-gleam-iterator.webp)

Deprecated...!?

先に説明しておくと、gleam/iteratorモジュールは遅延評価されるリスト形式のデータ型の定義、
及びユーティリティ関数がまとめられたモジュールです。

`gleam/list`モジュールからインデックスアクセスを行なう関数が削除されてしまったので、それができる`iterator.at`関数を使うのに重宝してました。

そんな便利なモジュールがどうして非推奨になったのかと言えば、
標準ライブラリから分離されて[gleam/yielder](https://hexdocs.pm/gleam_yielder/)というモジュールになっていたからでした。

ざっと見た感じ、`gleam/list`と特に関数の名前の違いはなさそうなのでマイグレーションは楽に終わられられそうです。

そんな訳で、gleamでiteratorを使いたくなったら`gleam/yielder`を使おうという話でした。
