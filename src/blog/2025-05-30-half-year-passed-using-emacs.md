---
title: 'Emacsを使い始めて半年が経った'
description: 'ある程度知見が貯まったので記事にしてみる'
pubDate: 'May 30 2025'
emoji: 🦊
tags: ["emacs", "ai"]
draft: false
---

本記事はVim駅伝の5/30の記事になります。\
前回は5/28のSirasagi62さんによる[忘れっぽいNeovim使いに贈るtoggle-cheatsheet.nvimの紹介](https://zenn.dev/sirasagi62/articles/309b7044c6d0da)でした。

---

かれこれEmacsを使い始めて半年以上が経っている。
Emacsに対する知見もある程度貯まったので、このあたりで一旦記事にしてみる。

## Emacsの基本設計

## EmacsとLisp

EmacsはLispで構築されているのは有名だけど、ここで一度その関係を整理していきたい。

通常、テキストエディタのスクリプティング機能はエディタが主でスクリプトが従になる。
しかしEmacsは**Emacs
Lispという処理系の上に偶々実装されている**ため、この主従関係が逆転している。

ここがEmacsの面白いところで、主従関係が逆転しているお陰で**スクリプティング機能からエディタの機能ほぼ全てにアクセスが可能**になっている。

## 起動方法について

Emacsは一般的なテキストエディタと同様に直接起動する方法の他に、デーモンを起動してクライアントから使う方法が存在する。

この方法を使うことでEmacsの起動速度の遅さをほぼ帳消しにでき、ウィンドウを閉じても`C-x C-e`で評価した状態を保持し続けられる。

ただし、デーモンから起動したEmacsはGUIの起動がやや特殊で設定に難儀させられる事もある。

https://apribase.net/2024/06/20/emacs-as-daemon/

個人的にはそこまで困っていないので、もし起動速度に悩んでいたら一度試してみることをおすすめしたい。

## 設定ファイル

設定ファイルには`.emacs`と`.emacs.el`と`init.el`の3種類があるが、新たに始めるならdotfilesでの管理がしやすいので`init.el`がおすすめ。

https://qiita.com/tadsan/items/a2018379ffaadf07a418

また、`init.el`の他に`early-init.el`という設定があり、これは名前の通り`init.el`の前に実行される。

具体的な使用目的としては、GUI周りの設定をここに書くことで画面が表示させる前にメニューバーを非表示にできる。
こうする事で画面が表示されてからコンポーネントが非表示になることを回避できるので、チラつきを防げる。

## Emacsとパッケージ管理

EmacsはVimと異なりパッケージをレジストリで管理する形態をとっている。(もちろんGitから直接インストールすることも可能)

Emacsでパッケージをインストールする方法は`package.el`の対話型UIを使う方法と`use-package`を使う方法の2つがある。

ただ、前者はコードでのパッケージ管理が難しいためもっぱら後者の`use-package`が用いられる。

## パッケージマネージャー

特にこだわりがないのなら`leaf.el`を使うと良い。僕はEmacsに慣れ始めた段階からleaf.elを使っている。
`use-package`にある落とし穴にハマるのを防ぐような仕様になっているし、日本語圏のEmacsユーザーはleaf.elを使っている割合が高いので困ったときにすぐ質問できるというメリットがある。

他には`elpaca`や`straight.el`などがあるが、基本的に標準の`use-package`を使うのが良い。

### Nix

EmacsはNixとも相性が良く、nixpkgsには沢山のEmacsパッケージが公開されている。

https://search.nixos.org/packages?channel=24.11&from=0&size=50&sort=relevance&type=packages&query=emacspackages

これらのパッケージを使うと、**予めパッケージがインストールされたEmacs**を宣言的に記述できるため、パッケージマネージャを使ってパッケージをインストールする必要性がなくなる。
また、nixpkgsにあるEmacsパッケージはデフォルトでnativecompが施されているので高速に動作する。

https://blog.tomoya.dev/posts/hello-native-comp-emacs/

EmacsをNixで管理する場合は先ほどの`leaf.el`に`:ensure t`なしでパッケージを記述すれば良いので設定が簡潔になり起動も安定する。

また、EmacsでNixをビルドするプロジェクトとしてTwist.nixというプロジェクトがある。
EmacsをNixで管理すると起動速度が遅くなってしまうが、Twist.nixを使うと起動速度を担保した状態でNixの恩恵を享受できる。

https://zenn.dev/kyre/articles/b1959567edfc15

## ミニバッファ

EmacsをEmacsたらしめる機能のひとつにミニバッファがある。
ミニバッファとはEmacsの画面したに表示され、ユーザーに操作や情報を提供するバッファで、
Emacsではミニバッファを使ってFuzzy Finderや便利なUIが実装されている。

最近ではこのミニバッファを活用したいパッケージが広く普及しており、

- UIを提供する[vertico](https://github.com/minad/vertico/)
- ソースを提供する[consult](https://github.com/minad/consult)
- 順不同のマッチングを提供する[orderless](https://github.com/oantolin/orderless)
- コンテキストに沿った操作を提供する[embark](https://github.com/oantolin/embark)

などがある。

https://blog.tomoya.dev/posts/a-new-wave-has-arrived-at-emacs/

## Tree-sitter

Neovimでは組み込みになって久しいTree-sitterだけれど、実はEmacs29で標準になっている。

https://zenn.dev/glassonion1/articles/20752bb8d2cf98

Tree-sitterを使うモードは`typescript-ts-mode`のように`*-ts-mode`という名前の新たなモードとして追加されている。
そのため、既存のモードに設定をhookしている場合は別途対応が必要。

## LSP

EmacsでももちろんLSPが使える。 著名なクライアントは

- eglot
- lsp-mode
- lsp-bridge

などがある。

### eglot

Emacs標準のLSPクライアント。
特にこだわりがなければeglotが良い...と言いたいけどここで一つ問題がある。
eglotは*multi-server機能が実装されていないため、複数のLSPサーバーを使用したい場合(主にフロントエンドが当てはまると思う)は別途マルチプレクサを導入する必要がある。

マルチプレクサは[lspx](https://github.com/thefrontside/lspx)が比較的よく使われている。
[eglotのissue](https://github.com/joaotavora/eglot/discussions/1429#discussioncomment-12454231)でも紹介されている。

僕も手元で動かしてみたのだけど、わりと良い感じに動いてる。
僕の環境だとlsp-modeとDenoの相性がすこぶる悪いので今後はeglot +
lspxの構成でやっていきたいなと思ったりしてる。

### lsp-mode

サードパーティー実装のLSPクライアント。
先述したmulti-server機能が実装されているため、フロントエンドでも使える。
ただ、僕が使っていた時はDenoで補完がされなかったり、Code
Acitonが使えなかったりするので個人的にはあまりおすすめできない。

### lsp-birdge

Pythonを使い高速なレスポンスが特徴なLSPクライアント。
Pythonを使っているので導入に難があるけれど、Nixを使ってEmacsを管理することでこれらの弱点を帳消しにできる。

lsp-modeにあったDeno関連の不具合もないため、最近はこれを使っている。(が、安定性の観点から使用を続けるか迷っている...)

また、lsp-bridgeはmulti-serverが実装されているのでフロントエンドなどでも問題なく使用できる。

唯一の問題として、lsp-bridgeは独自の補完フレームワーク`acm.el`を採用しているので既存のthemeが適用されないというものがある。

これについてはREADMEにある`acm-frame-background-dark-color`と`acm-frame-background-light-color`を指定して馴染ませると多少マシになる。

アイコンの配色に関しては公開されたAPIはないけれど、恐らくこのあたりを書き換えれば変更は可能なはず。(未検証)

https://github.com/manateelazycat/lsp-bridge/blob/69d1eb8509fbb72d2a3db241f0f1871a3e2c6437/acm/acm-icon.el#L94

## 補完UI

LSPではlsp-bridgeを使っている流れでacm.elを使っているが、その他の補完ではcorfuを使っていた。

しかし、acm.elには後述するtempelに対応する実装が含まれているため全てacm.elに寄せてしまうかもしれない。

corfuはちょうどverticoがポップアップUIになったかのような挙動をする。
と言うより、両者は内部的に同じロジックを共有している。

そのためverticoを使っている人にとってはとても扱いやすいためおすすめできる。

また、verticoでいうconsultに対応するパッケージとして[cape](https://github.com/minad/cape)があり、これを使うと便利な絞り込みをすぐに使えるので便利。

## テンプレート

テンプレートには[tempel](https://github.com/minad/tempel)を使っている。
corfuと同じ作者さんのパッケージで、シンプルに使えるのでおすすめ。

テンプレートファイルは`template`と固定になっていて、lispチックなデータ形式で設定するところが少し戸惑うかも知れないけれど、テンプレート自体も書きやすいと感じている。

僕のテンプレート設定はここから見れるので書く際は参考にしてほしい。

https://github.com/Comamoca/dotfiles/blob/main/emacs.d%2Ftemplates

## AI

Emacsは比較的AIと相性が良いと思っていて、その理由として以下の要素が挙げられる。

### org-mde

Emacsにはorg-modeと呼ばれる軽量なテキスト形式がある。

org-modeは

- Obsidianのようなグラフベースのナレッジ構築
- Jupyter Notebookのような実行可能な文章の記述
- 様々な形式に変換可能な万能文書

のように様々な使い方ができるEmacsのキラーアプリケーション。

EmacsでLLMを扱う最もスタンダードなパッケージである[gptel](https://github.com/karthink/gptel)にはorg-mode統合が含まれており、
それぞれの見出しごとに会話を分割し並列に進められる機能がある。

また、org-modeには別の文章とリンクできる機能があるため、会話をナレッジとして整理しやすい。

更に、org-mode自体markdownのような軽量なテキスト形式なこともあって、他のAIの読み取りやすさも確保されている。

### クレデンシャル

AIをテキストエディタ上で扱う際、問題になるのがクレデンシャルの管理だと思う。

Emacsにはauth-sourceというクレデンシャルの管理に特化したパッケージが**デフォルトで組み込まれている**。

auth-sourceについては以下の日報に書いてある。

https://comamoca.dev/blog/2025-03-25-diary/

### SKK

SKKはシンプルなかな漢字変換システムで、シンプルな実装からテキストエディタ上での実装が可能である。

複雑な実装になりがちなIMEではトラブルに悩まされることも少なくないが、SKKを使うとすべての機能がテキストエディタ上で動作するのでこららの問題を解消できる。

僕は3年ほどSKKを使っているけれど、比較的長い文章を書くことが多いこともあってそれらの執筆体験が非常に快適になったと感じている。

また、AIとの対話には基本的に文字入力で行うが、SKKのお陰でOS由来のトラブルは回避できるので、よりAIとの対話に集中できる。

EmacsにおいてSKKを使うには[ddskk](https://github.com/skk-dev/ddskk)というパッケージがデファクトなのでこれを使うのがおすすめ。

また、SKKと合わせてAZIKを使うとさらに文字入力の効率が上がるので合わせて使うのがおすすめ。

### その他のパッケージ

### smartchr.el

smartchr.vimをEmacsに移植したもの。
同じキーを複数回押すと設定した順に文字が置き換わる。
`->`など押しづらいキーを`.`に割り当てると便利。

https://zenn.dev/pixiv/articles/ba04b5977964cf

Gleam向けにこんな設定を書いてみた。
`>`連打で記号が打てるのでより快適になった気がする。

```
(leaf smartchr
  :require t
  :config
  (define-key evil-insert-state-map (kbd ">")
	      (smartchr '( ">" "-> " "|>" "<>" "<-" ))))
```

似たような方法としてこんなやり方があるけど、これはVim限定なので本家VimプラグインはNeovimでも使えそうだしそっちも使ってみたいと思っている。

https://zenn.dev/vim_jp/articles/b4294351def1ba

### 使っていないけど気になるパッケージ

### verb

https://github.com/federicotdn/verb

EmacsのHTTPクライアント。 Postman的な用途でAPI開発に役立ちそう。

### quickrun

https://github.com/emacsorphanage/quickrun

[quickrun.vim](https://github.com/thinca/vim-quickrun)というVimプラグインのEmacs版。
シュッとプログラムを実行できるので良さそう。

### apheleia

Emacsのフォーマッタ。
フォーマッタで言うと[emacs-reformatter](https://github.com/purcell/emacs-reformatter)が有名だけど、
このパッケージはフォーマット後にカーソルの位置がズレないような仕組みがあったりする。

また、非同期で動くので大きなファイルでも快適にフォーマットがかけられそう。

https://github.com/radian-software/apheleia

## まとめ

ここまでEmacsを半年間使ってみた感想だとか知見を書いてみた。
Emacsは使えば使うほど新しい発見があって楽しいので、これからも色々調べていきたい。
