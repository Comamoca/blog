---
title: "フルスタックLustreアプリケーションに可能性を感じている"
description: "CloudflareがGleam普及の鍵かもしれない"
pubDate: "Aug 16 2025"
emoji: 🦊
tags: ["gleam"]
draft: false
---

## 概要

GleamはErlangとJavaScriptに変換できる静的型付け言語。
ただErlangは日本ではあまり使われていないので、Gleamを普及させるにはAltJS的な切り口がとっつきやすいのではないかと考えている。

また、JavaScriptアプリケーションを実行する環境としてのCloudflareと組み合わせた時に相性が良いのではと考えている。

## Cloudflare WorkersのStatic Assetsについて

最近Cloudflare WorkersのStatic Assets(以下Static
Assetsと呼ぶ)という機能が公開された。
この機能はworkersの特定のディレクトリを静的ファイルの配信に使えるもので、静的ファイルの配信に関してはリクエスト数を消費しないというもの。

つまり、Pagesの機能の一部がWorkersに取り入れられたということになる。

詳しい解説は公式のリリースとか以下の記事が参考になるのでそちらをぜひ。

- 公式ドキュメント https://developers.cloudflare.com/workers/static-assets/

- Remixを動かす例 https://zenn.dev/sora_kumo/articles/cloudflare-workers-remix

これは「静的HTMLとそのサーバーを同じプロジェクトとして開発できるよ」という事なのでかなり開発体験に影響を与えるものだと思う。

## で、Gleamとどう関係するの？

ここからはGleamの話。
Gleamには[TEA](https://guide.elm-lang.jp/architecture/)を採用したwebフレームワーク[Lustre](https://github.com/lustre-labs/lustre)がある。

このフレームワークの面白いところとして、UIを描画する関数(Lustreではこれをview関数と呼んでいる)が副作用を持たない設計なため**どこでもview関数をレンダリングできる**。
これだけで僕としてはキャッキャウフフしたくなるのだけど、更に最近のアップデートでパフォーマンスがReactとギリギリ張り合えるレベルにまで改善したり、
Lustreのコンポーネント(ややこしいがview関数とは異なり状態を持っている)をLustreに依存しない形でexportできたりとかなり実用的になってきている。

このあたりの変更については以下のドキュメントを参照されたし。

https://hexdocs.pm/lustre/announcements/2025-08-08.html

で、Lustre自体もかなり魅力的なのだけど、これを先程のStatic
Assetsと組合せると**サーバーレスでフルスタックにGleamアプリケーションを構築できる可能性**が出てくる。
CloudflareにはKVやDB(D1)もあるので、小規模〜中規模のアプリケーション構築なら耐えられそうだし、DBだけ外部に切り分けるといったことでDBの問題もある程度は対応できそうだとも思っている。

## 具体的な方法は？

今日サンプルアプリケーションをチマチマ書いてたりしたのだけど、残念ながらまだ未完なのですぐ出せる状態ではない...
その代わりにこうすれば構築できるんじゃないの？というアイデアをここに共有したいと思う。

### フロントエンド

まずフロントエンド。これは先述したLustreを使う。
Lustreはビルドすると単一のJavaScriptファイルになるため、Static
Assetsで配布できる。
[Lustre dev tools](https://github.com/lustre-labs/dev-tools)を使うとエントリポイントとなる`index.html`も生成してくれるけど、ビルドしたJSが`./priv/css`に配置されるのにも関わらず、`index.html`はプロジェクトルートに配置されるので上手くStatic
Assetsとして出力できない。また、出力先を変更するオプションもない。(これは内部でJS/CSSのパスを計算するのが億劫だからだと個人的には思ってる)

なので、`index.html`自体もLustreで生成してそれを`./priv`へ配置するGleamスクリプトを作成する必要がある。
これに関してはGleam
v1.11.0で入った変更で`gleam dev`コマンドがあるので、それを使えば良さそう。

https://gleam.run/news/gleam-javascript-gets-30-percent-faster/

### バックエンド

Gleamでworkersを書くにはちょっと工夫が必要。
これはGleamでHTTPを扱う[gleam/http]()で定義されているリクエスト/レスポンス型が独自に定義されたもので、JSのそれとは別物となっているから。
それを上手く翻訳してくれるパッケージとして[conversation](https://github.com/MystPi/conversation)があるので、それを使うのが良いと思っている。

また、workersをGleamで書くパッケージを調べると[glen](https://github.com/MystPi/glen)というのが出てくるけど、これは[現状動かない](https://github.com/MystPi/glen/issues/9)ので使えない。

とはいえGleamではパスルーティングをパターンマッチで行う慣習があるので、そこまで大きな問題ではないと思っている。

```gleam
// こんな感じ
import gleam/http/request
import gleam/http/response

fn hander(req) {
  case request.path_segments(req) {
    [] -> response.new(200)
	_ -> response.new(404)
  }
}
```

### データベース

データベースに関しては[parrot](https://github.com/daniellionel01/parrot)と[cake](https://github.com/inoas/gleam-cake)の2つの選択肢がある。

前者は[sqlc](https://github.com/sqlc-dev/sqlc)を使ってGleamのコードを生成するというもので、後者はクエリビルダとなっている。

当然どちらもsqliteに対応している。つまりD1で使うことができる。
このあたりはあまり試せていないので色々試していきたいところだったりする。

### HTTPリクエスト

再びLustreの話に戻ってしまうのだけど、LustreでHTTPリクエストをどう送るかについて紹介していきたい。
これまで述べたように、LustreはTEAを採用しているのでHTTPリクエストはSide
Effectとして型で明確に区別される。

具体的には[公式ドキュメント](https://hexdocs.pm/lustre/guide/03-side-effects.html)が詳しい。

LustreでHTTPリクエストを送るライブラリとしては以下のがあるが、現在ではrsvpが人気らしい。

- [rsvp](https://github.com/hayleigh-dot-dev/rsvp)
- [lustre_http](https://codeberg.org/kero/lustre_http)

特にrsvpはデコーダーも兼ね備えているので扱いやすいという利点がある。

## で、結局どうなの？

個人的には期待している分野ではあるものの、他のGleamユーザーはあまりこの分野に積極的でないように見えるのがやや不安であはる。
けれどそれは諦める理由にはならないので可能性を追い求めるつもり。

エコシステムに関しても、問題になる物量に関して最近はClaude
Codeがあるので、不可能から困難まで敷居が下がっているのを感じる。
つまり頑張ればなんとかなりそうだと考えている。

## 余談

って話を今日しようと思ったのだけど、酔っ払っててそれどころじゃなかったし単純に頭から吹っ飛んでたので急遽ブログに書いてみた。
これに関しては引き続き試してみたいところ。また何かあったら記事なりスクラップなりで報告していきたい。
