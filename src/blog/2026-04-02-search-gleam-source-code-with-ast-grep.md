---
title: "ast-grepでGleamのコードを検索する"
description: "skillsにすると良い感じに使ってくれるのでオススメ"
pubDate: "Apr 2 2026"
emoji: 🦊
tags: ["tech", "ast-grep", "gleam"]
draft: false
---

[小宮果穂](https://shinycolors.idolmaster-official.jp/idol/hokagoclimaxgirls/kaho/)さん、お誕生日
248日目おめでとうございます！

---

この世には[ast-grep](https://ast-grep.github.io/)と呼ばれるツールがあります。

これは旧来のgrepとは異なり構文単位で検索が可能になるという代物です。
構文単位での検索が可能となるので、簡易的なlintとして使ったり、コードを破壊せず置換を行えたりします。
また、構文を使って直接検索できるのでコーディングエージェントがコードを検索する時に必要な情報のみを取得できトークンの消費量を抑えられるというメリットもあったりします。
Claude Codeで使う場合は公式がskillを公開しているのでそれを使うのが良さそうです。

https://github.com/ast-grep/agent-skill

そんな便利なast-grepですが、残念なことに現時点(2026/4/2)ではGleamに対応していません。
そこで今回はそんなast-grepをGleam対応させる方法を紹介します。

## ast-grepで任意の言語を扱えるようにする

ast-grepはその名の通り検索対象をASTに変換してから検索処理を行います。
このパース処理を行っているのがtree-sitterです。
tree-sitterは高速なパーサジェネレータ・構文解析ライブラリで、最近ではテキストエディタのハイライトなんかにも使われています。

ast-grepがtree-sitterを用いているという事は、**理論上tree-sitterを提供している言語はなんでもast-grepで検索可能という訳です。**
Gleamの場合公式がtree-sitterのgrammerを提供しているので、それが使えます。

https://github.com/gleam-lang/tree-sitter-gleam

## 設定していく

公式ドキュメントに[Mojo](https://www.modular.com/mojo)のサポートを追加する例が紹介されているので、これを見ながら設定していきます。
Mojo久々に聞いたな...

https://ast-grep.github.io/advanced/custom-language.html#custom-language-support

ast-grepで任意の言語を検索対象として設定するには、言語ごとの設定を`sgconfig.yml`というファイルに記述する必要があります。

### Nixでは

僕は普段Nixを使っているのでNix前提で書いていきますが、大体こんな感じで書けば設定できます。
NixにはNix式からYAMLを生成する関数があるので、それを使って設定ファイルごとNixで生成します。
こうすることで、grammerのパスをNix式から埋め込めるのと、全部の設定を`flake.nix`で完結できるので設定ファイルを管理する手間を多少省けます。

grammerを取得するために`pkgs.vimPlugins.nvim-treesitter-parsers.gleam`を指定しています。
nixpkgsにはtree-sitterのgrammerを提供するパッケージが2種類あり、うち一つが`tree-sitter-grammars`、もう一つが`vimPlugins.nvim-treesitter-parsers`です。

両者の違いは

```nix
yamlFormat = pkgs.formats.yaml {};
ast-grep-config = yamlFormat.generate "sgconfig.yml" {
  customLanguages = {
    gleam = {
      extensions = ["gleam"];
      libraryPath = "${pkgs.vimPlugins.nvim-treesitter-parsers.gleam}/parser/gleam.so";
    };
  };
};
```

生成したYAMLファイルはShellHookでsymlinkを貼ってdevShell内でファイルとして扱えるようにします。

```nix
devShells.default = pkgs.mkShell {
  shellHook = ''
    ln -sf ${ast-grep-config} sgconfig.yml
  '';
};
```

このNix式で生成した設定ファイルをShellHookでsymlinkにして扱えるようにするテクニックは[mcp-servers-nix](https://github.com/natsukium/mcp-servers-nix)等でも使われています。
この方法でtextlintの設定ファイルなども管理できるので、そういう方法が存在することだけでも頭に入れておくと役に立つのでオススメです。
