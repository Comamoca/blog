---
title: 'どうして設定しなければいけないのか'
description: '持論です。'
pubDate: 'Sep 19 2024'
emoji: '🦊'
tags: []
---

- 持論です。
- 根拠は特にありません。(N=1)

---

どうしてテキストエディタを設定しなければいけないのか、自分なりの考えがまとまってきた気がするので書いてみる。

## 結論

人間に一人として同じ個体はいないため、**設定という個人レベルの最適化**でその差異を吸収する必要がある。

## 人間に同一個体は存在しない

少なくとも現時点では。(クローン人間とかはまだいないはず)

人間というのはみんな同じに見えて実は結構違いがある。
例えば手。一旦自分の手の平と近くの人の手の平を見比べてみて欲しい。

手の大きさ、指の長さ、太さ、そういったものだけ見ても結構違いがあるはずだ。

手のようにはっきりと目に見えるものではないけれど、考え方などはもっと違いがあるはず。

### キーバインドから見る違い

そういった違いはキーバインド一つとってみても差が出てくると思っている。

例えば自分の手は、体の割には大きくて指が細長いのでキー間の距離が長いキーバインドでも結構耐えらるし、逆に何度もキーを連打するようなものは苦手だったりする。(EmacsのCtrl連打が苦手なのはこれがあったりする)

考え方でいうと、自分はキーに意味を紐付けるのではなく体で覚えるのが好きなので、過去の慣習とかでエイヤっと決めてしまう[^1]。

また体で覚えるタイプなのでVimのようなキー配列に依存するhjklみたいなキーバインドが好きだったりする。

### 性格から見る違い

自分はわりとせっかちなので**エディタの起動に1秒も待ってられない**し、**一々マウスに手を伸ばすとかやってられない**性格をしている。

なので起動が速いVim[^2]を使っているし、`$HOME`から**10秒以内にコードが書き始められる環境**を維持するように努めている。

こういった個人の性格というのは設定に大きく関わってくると思っていて、

- エディタの起動に3秒かかっても良いから豊富な機能を持つものを使いたい。[^3]
- 別にLSP要らないからプラグインの管理コストが低いものが良い

だったり個人の性格に影響される設定項目はかなりの量があると思う。

### マシンスペックから見る違い

これもダイレクトに働いてくる違いで、例えば自分が過去に使っていたマシンだとRAM2GBのノートPCがあったりする。

こう言ったマシンではGnomeのようなリッチなDEはまともに動かない[^4]ので、当時はi3wmという素朴なタイリングDEを使っていた。

今は8GBと余裕があるのでi3wmよりリッチな表現をしてくれるHyprlandを使っている。が、これも基本操作はi3を踏襲する形の設定にしている。

## デフォルト設定は変えられるものである(べき)

VSCodeだったりVimだったりと、**自分が知りうるエディタ全てにデフォルト設定がある**。

だけどそれらはマジョリティに合わせたものだったり開発者の好みだったりするので、**必ずしも自分にとっての最善でなはい可能性がある**。

もしこの記事を読んでいる人で、デフォルト設定のままVSCodeを使っている人がいたら、1つでも押しづらいな...
と感じたキーマップを自分の押しやすいものに変更してみて欲しい。

きっと明日からのコーディングが少し楽になると思うし、それを願っている。

[^1]: 中学の頃Uniteで全sourceから選択する操作に`<C-u>`を設定してから惰性でDduでもその設定を使っている。

[^2]: Emacsもemacsclient使えばVimより速く起動するのでこの点は結構アリだと思っている。そもそもEmacsは一々終了したりするもんじゃない。

[^3]: にわかには信じられないが...

[^4]: メモリを半分持ってかれる