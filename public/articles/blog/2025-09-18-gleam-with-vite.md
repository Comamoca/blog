---
title: "ViteでGleamを使う"
description: "9/19のReact Tokyoで登壇するLTの補助資料です。"
pubDate: "Sep 18 2025"
emoji: 🦊
tags: ["gleam", "vite"]
draft: false
---

明日のReact Tokyoの補助資料を兼ねているのでざっくりと書いていきます。

---

GleamはJavaScriptにコンパイルできるため、フロントエンドの開発に使える。

この記事ではフロントエンドの開発では主流となっているViteでGleamを使う方法を解説していく。

パッケージマネージャは好きなもので大丈夫。最近サプライチェーン攻撃が怖いので最新のパッケージに時間経過の制約をかけられるpnpmが良いんじゃないだろうか。

ここではnpmを使って解説していく。(実証自体はbunを使った。)

## Viteのセットアップ

いつもどおりViteをセットアップしていく。
Viteでプロジェクトを作成する時は**Vanilla**かつ**JavaScript**を選択する。

```sh
npm create vite@latest
```

## Gleamのインストール

次にGleamをインストールしていく。

既にインストールしている人は飛ばしてOK。
Gleamをnpmでインストールできるパッケージとして[@chouquette/gleam](https://www.npmjs.com/package/@chouquette/gleam)があるので、フロントエンドに慣れている人はそれを使うと良さそう。

```sh
npm install @chouquette/gleam
```

mise等でもインストールできるため、それを使うのもアリ。

https://mise.jdx.dev/registry.html

個人的なオススメはNix。普段は[自作のテンプレート](https://github.com/Comamoca/scaffold/tree/main/gleam-basic)を使って一撃でインストールしている。
Nixとdirenvを使っている人は以下のコマンドで最新のGleamが手に入る。

## vite-gleamをインストールする

ViteでGleamを扱うには[vite-gleam](https://www.npmjs.com/package/vite-gleam)プラグインが必要。

```sh
npm i vite-gleam
```

`vite.config.js`にプラグインの設定を追加する。

```js
import gleam from "vite-gleam";

export default {
  plugins: [gleam()],
};
```

```sh
nix flake init -t github:Comamoca/scaffold#gleam-basic
direnv allow
```

## Gleamプロジェクトのセットアップ

Gleamプロジェクトをセットアップしていく。
`.gitignore`があると`gleam new`する際にエラーになるので、バックアップを取るなり消すなりする。

`gleam new .`を実行するとプロジェクトが作成される。

後で使うので、GleamのJS API
wrapperライブラリの[plinth](https://hexdocs.pm/plinth)をインストールしておく。

```sh
gleam add plinth
```

## ViteでGleamをコンパイルする

GleamはJavaScriptにコンパイルすると`main`関数が定義されたJavaScriptファイルを出力する。
実行自体はしないため、JS側で実行する必要がある。

`main`をimportしたJSファイルをimportする等、やり方は色々あるけれど一番手軽なのはHTMLファイルでimportする方法だと思う。
プロジェクトルートにある`index.html`ファイルをこんな感じに書く。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      import { main } from "/src/proj_name.gleam";
      main();
    </script>
  </body>
</html>
```

`proj_name.gleam`にこんな感じのプログラムを書いてみる。
plinthを使うとDOMを操作できるので、これでH1タグを作ってbodyに挿入してみる。

```gleam
import gleam/io import gleam/result
import plinth/browser/document
import plinth/browser/element

pub fn main() {
  let h1 = document.create_element("h1")
  element.set_text_content(h1, "Hello!")

  element.append_child(document.body(), h1)
}
```

こんな感じで表示されるはず。

![](/img/2025-09-18-235711.png)

## ビルド

以下のコマンドを実行するとビルドができる。
`vite.config.js`とかでも指定してみたけれど、なぜか適用できなかったのでそこは後で調べたい。

`npm run build index.html --outdir dist`

## まとめ

こんな感じでGleamはViteを使ってフロントを開発することもできる。
流石にplinthでDOMを組むのは骨が折れるので、[Lustre](https://hexdocs.pm/lustre/)だったり[redraw](https://hexdocs.pm/redraw/index.html)だったりとライブラリを使うことが多いと思う。

ただ、plinthはブラウザのAPIもwrapしているので、その場面ではお世話になることが多々ある。ドキュメントに目を通しておくのがオススメ。
