---
title: issue6 Gleam Weekly
description: Gleam Weeklyの内容を勝手に解説していきます。
pubDate: May 2 2024
tag:
  - gleamweekly
emoji: 🦊
draft: false
---

5月になりましたね。 今週もGleam Weeklyやっていきます。

## This week in Gleam

### Scriptorium - A simple blog generator

https://hexdocs.pm/scriptorium

Lustreで書かれたシンプルなブログジェネレーターです。
LustreのOrgにはSSGのリポジトリがあるのでいつか出るとは思っていましたがわりと早く出てきました。

注意点として、Node.js上でしか動かないので注意です。

## The optimizations in Erlang/OTP 27

https://www.erlang.org/blog/optimizations/

Erlang 27で追加された最適化についての記事です。
ErlangのJITにまつわる最適化について詳細に書かれていて参考になります。

## Big Ben 1.0

https://github.com/maxdeviant/bigben

Gleamの時刻ライブラリには[birl](https://github.com/massivefermion/birl)というのがありますが、bigbenはbirlに擬似的な時刻を与えるものとなっています。
なので開発というよりテストに向いていそうな印象を受けました。

## Even more great Gleam stuff

### Catppuccin: Soothing pastel library Project update

https://github.com/MAHcodes/catppuccin

カラーテーマで有名なCatppuccinのGleamライブラリがアップデートされました。
このライブラリを使うと、GleamコードからCatppuccinのカラーパレットにアクセスできます。

### A simple parallel map library Project update

https://github.com/PastMoments/parallel_map

Gleamのリストを用いて並列処理を簡単に実行できる単純なライブラリです。
個人的にElixirのFlowに近いものを感じました。Gleamでもそのような計算向けのライブラリが増えていって欲しいですね～。

## まとめ

今回のGleam Weeklyはライブラリのアップデートが中心になってました。
最近のGleam界隈はライブラリがポンポン生まれていて圧倒されます。自分もそろそろ何か書いて公開したいです。
