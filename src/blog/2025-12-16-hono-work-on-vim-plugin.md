---
title: "HonoをVimプラグインにしちゃおう"
description: "HonoをVimで使う方法を紹介します。"
pubDate: "Dec 16 2025"
emoji: 🦊
tags: ["hono", "gleam"]
draft: false
---

この記事はHonoアドベントカレンダー16日目の記事です。

## Honoは便利

Honoはサーバーを立ち上げるまでに必要な最小ステップが小さいです。
また、コードサイズが小さいためプラグインとして組み込んでも影響が少ないです。

## Vimからでも使いたい

Honoは便利ですが、HonoはTypeScriptなのでVimでは直接動きません。
そこで、[denops](https://github.com/vim-denops/denops.vim)を使います。
denopsはDenoを使ってTypeScriptでVimプラグインを作成できるプラグインエコシステムです。

現在広く使われているVimの実装にはVimとNeovimがあるのですが、両者は細かいAPI等の違いやそもそもプラグインに使える開発言語が異なったりなど、両方に対応したプラグインを開発するのが大変でした。

また、以前はjob
API等がなくVimで重い処理を実装すると動作がブロッキングし体験が悪くなるなどの問題がありました。
そもそもプラグイン開発で広く使われているVim
Scriptはパフォーマンスが悪い等の問題もありました。

denopsは別プロセスでDenoを動かし、TypeScriptで書かれたプログラムとVimをmsgpackで通信する方法を使いこれらの問題を解決しています。
これまでにも似たような発想でNeovimの[remote plugin](https://speakerdeck.com/yuki_ycino/developing-remote-plugin-in-typescript)等のプラグインエコシステムが存在していましたが、denopsは
型安全かつnpmの資産を用いて高度なプラグインを開発できるとして、日本のVimコミュニティで広く使われています。

また、TypeScriptでプラグインを書ける特徴を活かして、プラグイン側でインターフェースを定義し、設定をユーザーに書かせるスタイルのプラグインも登場いています。

https://github.com/Shougo/ddu.vim

そんなdneopsですが、TypeScriptが動くので**当然Honoも動きます**。
という訳でHonoを動かすdenopsプラグインを作っていきたいと思います。

コードは[Comamoca/sandbox](https://github.com/comamoca/sandbox/tree/main/hono-vim-plugin)にて公開しています。
該当のディレクトリのみ欲し方は[tiged](https://github.com/tiged/tiged)で良しなにダウンロードしてください。
以下のコマンドでダウンロードできるはずです。
なお、カレントにファイルの中身をぶち撒けるのであらかじめディレクトリを作成して、その中で実行した方が良いです。

```sh
mkdir hono-vim-plugin
cd hono-vim-plugin
bunx tiged Comamoca/sandbox/hono-vim-plugin
```

## 起動してみる

denopsをインストールしている前提で進めます。
まずruntimepathにプラグインのパスを追加します。

```vim
set runtimepath += /path/to/hono-vim-plugin
```

Vimを再起動し、以下のコマンドを実行すると`http://localhost:8000`でサーバーが起動するはずです。

```vim
call denops#request('hono-vim-plugin', 'launchServer', [])
```

## シャットダウン

サーバーの起動は出来たものの、このままではサーバーのシャットダウンをする度にVimを落とす必要があります。
サーバーのシャットダウンもプラグインから行えると便利です。

`Deno.serve`で作成されるインスタンスには[shutdown](https://docs.deno.com/api/deno/~/Deno.HttpServer.shutdown)メソッドがあるため、これを用いてサーバーを停止できます。
ただ、denopsの各コマンドはdispatchとして実装するため、`let`でインスタンスをグローバルアクセスできるようにし、それを操作する必要があります。
このあたりもう少しきれいに書けたら嬉しいですね。

## 他の改善点

### Vimを落したらサーバーも止まる

denopsはVim上で動いているので、Vimプラグインとしてサーバーを動かすと当然止まります。
これはプレビューサーバーとして見ると都合が良いのですが、僕はプロジェクト毎にVimを起動し落とすスタイルなので若干都合が悪いです。

そこで最近追加されたhono
cliで別プロセスとして立ち上げると良い感じにプロセスを分けられて良さそうだなと思ったのですが、
ここまで来るともはやHonoである必然性が薄れてくるのでプラグイン前提で考えた方が良さそうです。

https://github.com/honojs/cli

## まとめ

使い道など
プレビューサーバー用途はもちろんですが、個人的にはWebからVimを操作するような用途で使えないかなと考えたりしています。
HonoはJSXが使えるので、良い感じにUIが作れますし、認証とかも楽に実装できるので色々面白いことができそうです。

あと、このネタ自体は[VimConf 2023](https://vimconf.org/2023/)の頃から考えていたものなので、かれこれ2年越しに放流したものになります。
もし先駆者の方がいたら先にごめんなさいをしておきます。

あと、Denoが動くということは当然[Gleam](https://gleam.run/)が動くということなので、denopsのGleam
wrapperとかも作ってみたい。
以前作ってみたことはあったのだけど、当時はGleam力が足りなくてAPIがイマイチでポシャったという過去があるのでまたリベンジしてみたいところ...

明日は[@hayatosc](https://qiita.com/hayatosc)さんの記事です！
