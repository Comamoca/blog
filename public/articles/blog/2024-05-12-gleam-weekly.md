---
title: issue8 Gleam Weekly
description: Gleam Weeklyの内容を勝手に解説していきます。
pubDate: May 12 2024
emoji: 🦊
draft: false
---

Gleam Weeklyの8回目です。

## This week in Gleam

### Meadow

https://github.com/JoelVerm/meadow

Gleamで[Solid.js](https://www.solidjs.com/)を扱えるライブラリです。
GleamにはLustreがありますが、LustreはVDOMを採用しているためVDOMを使っていない代替品があれば良いなぁと思っていました。
Solid.jsはVDOMを使っていないため、理想に近いかたちでSPAが作れそうだと期待しています。

### Gleam starter on Codesandbox Projects for Gleam

https://codesandbox.io/p/devbox/github/codesandbox/sandbox-templates/tree/main/gleam

[codesandbox](https://codesandbox.io/)にGleamのプロジェクトテンプレートが追加されました。
Gleamのオンライン実行環境といえば[Gleam Playground](https://johndoneth.github.io/gleam-playground/)ですが、実は2年ほど更新されておらず最新の仕様に追い付いていないので`use`など最近の構文を使ったコードではエラーが発生します。

## Even more great Gleam stuff

### Priorityq: A priority queue implementation based on max pairing heaps. Written in pure Gleam.

ペアリングヒープ[^1]をPure
Gleamで実装したライブラリがアップデートされたようです。

## まとめ

先週に引き続き基礎的なライブラリの話題が多かったような気がします。
大規模なライブラリを作るにはこういった基礎的なライブラリの存在が不可欠なので、これからのエコシステムの成長が楽しみです。

[^1]: 優先順位付きヒープの高速な実装。
