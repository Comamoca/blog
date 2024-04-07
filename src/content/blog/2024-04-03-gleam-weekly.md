---
title: '4/3 Gleam Weekly'
description: 'Gleam Weeklyの内容を勝手に解説していきます。'
pubDate: 'Apr 3 2024'
emoji: '🦊'
---

2 つめがなかなか来ないなぁと思っていたら 6 日前に来てました。気が付かなかった...

## This week in Gleam

### Monitoring Processes

https://code-change.nl/gleam-blog/20240322-monitoring-processes.html

`gleam/otp`には Erlang VM 上の`process`を実行できるけれど、この方法だと呼び出し先でクラッシュすると呼び出し元も巻き込まれてクラッシュする。
それを防ぐために呼び出し先の`process`を監視し、安全に実行する方法を解説している。

### Getting to know Actors in Gleam. Code BEAM SF 2024

https://www.youtube.com/watch?v=WaHx6n2UZJg

Code BEAM America で発表された Gleam の型付けに関するセッション。

### Lustre v4.0.0 released.

https://github.com/lustre-labs/lustre

Gleam で SPA を開発できるフレームワーク Lustre が v4 に到達した。Elixir Phoenix に影響を受けているらしく、個人的にかなり期待しているプロジェクト。
いつか記事を書きたい。

### Exploring Gleam with Genetic Algorithms

https://silasmarvin.dev/exploring-gleam-with-genetic-algorithms

Gleam で遺伝的アルゴリズムを Gleam で書いてみるというもの。遺伝的アルゴリズム自体馴染みがないので後でじっくり読んでみたい。

### Exploring the Gleam FFI

https://www.jonashietala.se/blog/2024/01/11/exploring_the_gleam_ffi/

Gleam で Erlang/Elixir/Rust/JavaScript と連携する方法を書いた記事。

## Even more great Gleam stuff

### Gleam's Core Team in the House. Beam Radio Podcast

https://www.beamrad.io/72

Gleam コアチームのポッドキャスト。

### Why the number of Gleam programmers is growing so fast Blog post

https://tahazsh.com/blog/why-gleam-is-good

Gleam の人気が高まっている理由を解説した記事。最近は構文がシンプルな言語が好まれる傾向があるのかも...なんて思った。

### PostgreSQL protocol decoder/encoder Project update

https://github.com/grodaus/postgresql_protocol

PostgreSQL とクライアント間で通信されるプロトコルを Gleam 実装したライブラリがアップデートされたらしい。

### Act, compose stateful actions to simulate mutable state Project update

https://github.com/MystPi/act

Gleam で可変な状態を表現するためのライブラリ。Actor と区別するためこのような命名になったらしい。個人的に気になっているライブラリ。

### Monitoring processes (2/3) Blog post

https://code-change.nl/gleam-blog/20240324-monitoring-processes.html

冒頭に紹介した記事の続編。今回のニュースレターにはないけれどこの次の記事も公開されている。
3/3 では Supervisors を使ったプロセスの監視を解説している。

https://code-change.nl/gleam-blog/20240326-monitoring-processes.html

## 余談

今回は`process`関連の話が多かった気がする。
Erlang VM の真価は軽量な process とそれを元にした堅牢なシステムなので当たり前っちゃそうかもしれない。

次回はどんな News が来るのか楽しみ。
あとメールの自動振り分けを設定したので次は来たらすぐ投稿できると思う。
