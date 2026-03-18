---
title: 好きなJS API/ライブラリ発表ドラゴン
description: 個人的に気に入っているJSライブラリを挙げてみる
pubDate: Nov 17 2024
emoji: 🦊
tags:
  - javascript
draft: true
---

前こんなポストをしたらなんかめちゃくちゃ通知来た。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">これ知らなかったけどめちゃ便利だな<a href="https://t.co/djXfKA4oAd">https://t.co/djXfKA4oAd</a></p>&mdash; こまもか🦊 (@Comamoca_) <a href="https://twitter.com/Comamoca_/status/1857126605241667953?ref_src=twsrc%5Etfw">November 14, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

味を占めたので記事にしてみる。

## JS API

ライブラリと書いたけれど、ツイートもJS APIに関係することなのでちょっとJS
APIの話を書いていく。

### URL.canParse

まずは冒頭のツイートでも挙げている`URL.canParse`。

これを知る前は有効なURLかどうかはこうやって確認していた。

```js
function isURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

まぁ面倒くさい。

そこで`URL.canParse`を使うと、

```js
URL.canParse(url);
```

こうなる。一行で済んでかなり楽になった。
あとこのメソッドは最近のブラウザには全部入ってるから心置き無く使える。

### Array.fromAsync

`AsyncIterator`を返す関数の結果を扱う方法としては、`for await`とかがある。

けれど、本心としては普通に`Array.from`みたいに配列に変換して扱いたくなることも多い。
`Array.fromAsync`は非同期版`Array.from`みたいな代物で、これを使うとこんな感じに便利に使える。

```ts
// expandGlobについては後述する
const files = await Array.fromAsync(expandGlob("*.md"));
```

このAPIはBaseline
2024で結構最近入ったものなので、もしかしたらまだ使えないブラウザもあるかもしれない。
Denoだと普通に使える。

### Web Cache API

`Cache`というインターフェースを使うと、
RequestとResponseの対をキャッシュとして保存できる。

このブログでもOGP情報をスクレイピングする処理で使っている。
キャッシュとかいう面倒な処理を楽に実装できたので、他のruntimeでも実装されて欲しいなと思っている。

該当個所はこんな感じ。

`match`メソッドはキャッシュが見つからない場合はundefinedを返すので、Undefinedかどうかを判定すればキャッシュヒットしたかどうか分かる。
自分はライブラリを使って判定しているけれど、`undefined`はfalseと判定されるはずなので普通に`if (resp) { ... }`でもいけそう。

もしキャッシュが見つかったら、それに対応する`Response`が返される。

```ts
const useCahce = !is.Undefined(Deno.env.get("NO_CACHE"));

// キャッシュを生成
const cache = await caches.open("fetchOgp");
const _url = new URL(url);

const resp = await (async () => {
  // キャッシュを検索
  const resp = await cache.match(url);

  // キャッシュがあったらそれを使い、なかったらfetchしてキャッシュに追加する。
  if (is.Undefined(resp) || useCahce) {
    const resp = await fetch(_url);
    await cache.put(req, resp.clone());

    return resp;
  } else {
    return resp;
  }
})();
```

なおfetchしてキャッシュに追加したいだけなら`add`メソッドがあるので、ただキャッシュを追加したいだけの場合はそっちの方が楽。
今回はfetchの結果を返す必要があるので`put`を使っている。

### localStorage API

セッションが閉じられても保持し続けるストレージ。

Baseline Widely availableなので幅広いブラウザで利用可能。
もちろんDenoでも利用できる。

```ts
localStorage.setItem("temari", "ramen");

const temari = localStorage.getItem("temari");
// "ramen"
```

使い勝手の良いKVとして扱えるので便利。
簡単なメモ帳程度ならこれで実装できそうだと思っている。

ただ暗号化とかは施されていないのでセキュリティには注意。

## まだ実装されていないけど期待しているもの

### Clipboard API

https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/clipboard

クリップボード連携は便利さとは裏腹に**実装はかなり面倒くさい**。

実装しようとするとブラウザ間の仕様の違いを把握しないといけなかったり、ものによっては―特に画像DOMをガチャガチャ練りまわして取得する必要がある。
Clipboard
APIが全てのブラウザで実装された暁には実装コストが大幅に下がることが期待できる。

## Deno Standard Library

**ここからが本題です。**

Deno公式はDeno Standard Libraryというものを公開している。

**Deno**と銘打っているけれど、JSRに移行されたことで**Node.jsやBunでも使えるようになった**。[^1]

https://jsr.io

という訳で便利なDeno Stdを紹介していく。

### path

このライブラリは執筆現在(2024/11/17)以下の環境で動く。

- Firefox
- Chrome
- Safari
- Deno
- Cloudflare Workers

https://jsr.io/@std/path

自分はプログラミングにおいて実装するのが面倒なカテゴリとして

- 文字列処理
- ファイル操作
- パス操作

が挙げられると思っている。
これらは頻出する割に面倒になりがちなのでできる限り楽に実装したい。

Deno Stdのpathライブラリはそんなパス操作を楽にしてくれる関数が実装されている。

また、このライブラリはWindowsで使われるパス形式とPOSIX形式の両方に対応していて、デフォルトでは自動で切り替えられる。
なのでWindows環境でも安心して使える。

#### parse

https://jsr.io/@std/path@1.0.8/doc/~/parse

ファイルパスを`root, dir, base, ext, name`に分ける関数。

```ts
parse("/home/hoge/fuga/piyo.txt");

// 出力
// {
//   root: "/",
//   dir: "/home/hoge/fuga",
//   base: "piyo.txt",
//   ext: ".txt",
//   name: "piyo"
// }
```

この出力は`format`関数を使うことで元のパスに戻すことが可能。

https://jsr.io/@std/path/doc/~/format

#### join

https://jsr.io/@std/path@1.0.8/doc/~/join

名前の通りパスを連結する関数になる。
この関数は前述したように実行される環境で結果が異なる。

```ts
join("hoge", "fuga", "piyo");
// POSIXなら"hoge/fuga/piyo"になる
```

### fs

このライブラリは**執筆現在(2024/11/17)Denoのみで動く**。
ファイルシステムを扱うライブラリだからそりゃそうだけども。

#### expandGlob

`Array.fromAsync`で触れた関数。
`*.md`のようなglob表現でファイルやディレクトリを操作して、その一覧を返してくれる。
戻り値が`AsyncIterator`となっているので、`fromAsync`すると結果をいっぺんにまとめられてとても便利。

#### walk

指定されたパスを再帰的に掘っていって、その一覧を返す関数。
再帰的に探索するのは地味に面倒なので助かる。

なおこれも`AsyncIterator`を返すので`expandGlob`と同様のことが可能。

### fmt

https://jsr.io/@std/fmt

テキストの書式を指定するための関数を提供するライブラリ。

このライブラリは執筆現在(2024/11/17)以下の環境で動く。

- Firefox
- Chrome
- Safari
- Bun
- Deno
- Node
- Cloudflare Workers

#### @std/fmt/colors

このモジュールはテキストに色を追加する関数を提供する。

例えば表示するテキストの色を赤色にしたければ、

```ts
import { red } from "jsr:@std/fmt/colors";

console.log(red("Hello!"));
// 赤色でHello!と表示される。
```

となる。

また任意の色で表示できる関数もあり、

```ts
import { rgb24 } from "jsr:@std/fmt/colors";

console.log(rgb24("Shinosawa", 0x46c5da));
// #46c5daでShinosawaという文字が出力される
```

という風に使える。

ただ、この関数で正しく色を表示するにはターミナルが**TrueColor**というものに対応していなければならない。

日常的にVimを使っている人ならば当たり前のように設定していると思う[^2]けど、そうではない人はこれを実行してみて欲しい。

Windowsで実行できない方はWindows
Terminalなら対応しているはずなので、とりあえずそれを使えば間違いない。

```sh
curl -s https://gist.githubusercontent.com/lifepillar/09a44b8cf0f9397465614e622979107f/raw/24-bit-color.sh | bash
```

これで切れ目なく綺麗に色が表示されたら、そのターミナルはTrue
Colorに対応していることになる。

### front-matter

https://jsr.io/@std/front-matter

FrontMatterを扱うライブラリ。

FrontMatterとは主にMarkdownファイルの先頭に記述して、そのファイルのメタデータを表現するもの。

このライブラリは執筆現在(2024/11/17)以下の環境で動く。

- Firefox
- Chrome
- Safari
- Bun
- Deno
- Node
- Cloudflare Workers

このライブラリは以下の形式のFrontMatterに対応している。

- JSON
- TOML
- YAML

#### extract

`any`モジュールにある`extract`関数を使うと、データ形式に関係なくFrontMatterを取り出せる。

[^1]: npx経由でDenoが落されれて、そのDeno経由でインストールされるので地味に実行コストがかかるけれど...

[^2]: ハイライトの表現力に関わってくるのでVimmerにとっては死活問題とされている。
