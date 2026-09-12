---
title: "GleamでOG画像生成サーバーを作った"
description: "既にこのブログで動かしている"
pubDate: "Sep 11 2026"
emoji: 🦊
tags: ["tech", "ogp", "gleam"]
draft: false
---

## 3行まとめ

- 最近ビルドのデプロイに時間がかかっていて、OG画像生成のコストも無視できなくなっている
- OG画像生成をLumeからworkersへ移行した
- OG画像生成がデプロイから消えたことでデプロイ時間が1分程度削減された

## OG画像生成をworkersに移行した

このブログはLumeっていうDeno製のSSGで運用しているのだけど、最近ビルド時間が無視できないレベルで長くなってているのでビルド時間の短縮を進めている。
その一環としてOG生成を従来のSSGパイプラインの載せるのではなくて、専用のOGサーバーを介して行なうようにした。

ブログのビルド処理のうち、画像まわりは結構時間がかかっていて、画像最適化とかは既にCloudflareの上で行うようにしてたりする。
OG画像は生成処理をworkersで実装する必要があるので見送っていたのだけど、満を持して移行したという形。

こんな感じでレンダリングされる。

<img src="https://og.comamoca.dev/og.png?l=post&t=GleamでOG画像生成サーバーを作った&d=既にこのブログで動かしている" />

## 実装

実装はGleamで行っていて、OG画像生成はsatoriと@resvg/resvg-wasmを使っている。
GleamはWebサーバー部分の実装で使っているのだけど、素のGleamとworkersにはギャップがあってそのままだと動かないので自作フレームワーク[hinoto](https://github.com/Comamoca/hinoto)を使ってworkersを実装している。

hinoto自体は昨年のGWあたりに実家でガッと実装してからライブラリのアップデートとかをチマチマやっているのだけど、実際に使ったことがなかったのでついでに使うことにした。
我ながら結構良い感じに作れててちゃんと動いてくれてるので良かったなという感じ。次はWebSocketとかサポートしたい。

サーバー以外ではOG画像の生成にsatoriを使っている。
satori自体はJSXからSVGを生成するライブラリだけれど、[satori-html](https://github.com/natemoo-re/satori-html)というパッケージを使えばHTMLをJSX
Treeに変換してくれるのでHTMLでsatoriを使うことができる。
このパッケージ自体はよく出来てるのだけど、最終更新が4年前といかんせん古いのとメンテもされてない。中身を見たら結構単純だったのでこれもalternativeをopencodeにガッと作らせてみた。

satoriを使ったパッケージなので名前はkomeijiにした。

https://www.npmjs.com/package/@comamoca/komeiji

このkomeijiへHTML文字列を流しこめばOG画像が作れるのだけど、ここでGleamのフロントエンドフレームワーク[Lustre](https://github.com/lustre-labs/lustre)を使う。
これはTEAベースのフレームワークなのだけど、DOM
Treeを生成する関数はTEA関係なく利用できてなおかつDOM
Treeを文字列に変換する関数もあるので、それを使っている。
以前はこの手のHTML生成用途に[nakai](https://github.com/aslilac/nakai)を使ってたのだけど、Lustreの方が上位互換なので最近はそっちを使うことにしている。

komeiji自体はJS PackageなのでGleamから使うにはFFIが必要となる。
そのあたりを良い感じにwrapしたパッケージも作成した。
satoriとkomeijiを使うパッケージなので名前はkoishiにした。

https://github.com/Comamoca/koishi

命名はTwitterで頂いたものを採用した。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">koishiのほうが良かったのでは（横槍） <a href="https://t.co/mz4ht3BHmi">https://t.co/mz4ht3BHmi</a></p>&mdash; しろね⿻ (@aqyuki21s) <a href="https://x.com/aqyuki21s/status/2095508088745021877?ref_src=twsrc%5Etfw">September 3, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>

これで、Lustreで記述したHTML
Treeをsatori経由でpngへ変換するフローが簡単に書けるようになった。

```gleam
import gleam/io
import gleam/javascript/promise
import koishi
import koishi/lustre
import lustre/attribute
import lustre/element/html

pub fn main() -> promise.Promise(Nil) {
  // Load your font file as a BitArray. satori accepts
  // TTF, OTF, and WOFF — WOFF2 is not supported.
  let font_bytes = read_font_bytes()
  let font = koishi.Font("Inter", font_bytes, 400, koishi.NormalStyle)
  let options =
    koishi.Options(width: 1200, height: 630, fonts: [font], debug: False)

  let og_image =
    html.div([attribute.style("display", "flex")], [
      html.h1([], [html.text("Hello from koishi!")]),
    ])

  lustre.to_svg(og_image, options)
  |> promise.map(fn(result) {
    case result {
      Ok(svg) -> io.println(svg)
      Error(koishi.SatoriError(message)) -> io.println("Error: " <> message)
    }
    Nil
  })
}
```

svgをpngにしたかったら[to_png](https://koishi.hexdocs.pm/koishi.html#to_png)を使ってpngにもできる。
実態はresvgのwrapperなので、使用するにはresvgをインストールする必要がある。

## 移行してどうだったか

現状安定して動いている。
以前はデプロイに最大10分かかっていたけれど、nixの最適化やビルド時の画像最適化処理の削減など色々やったこともあり3分でデプロイされるようになった。
自作Webフレームワークのドッグフーディングもできたし、やって良かったと思っている。

## まとめ

今回はブログのOG生成をworkersへと移行した話を書いた。
ブログのビルド速度は開発体験や記事の更新しやすさにも直結する話なので、今後も改善は続けていきたい。

現状改善したい点として、現状手元で記事をプレビューする際に数分かかっていて結構ストレスなので、Lumeから[ox-content](https://github.com/ubugeeei-prod/ox-content)に移行することで改善できないか試してたりする。
あと記事をもっぱらEmacsで書くので、この際に原稿をmarkdownからorgへと移行したかったりもする。このあたりもやっていきたいなと。
