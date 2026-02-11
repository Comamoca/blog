---
title: "Hono Hackathonに行ってきた"
description: "Hono Hackathonコントリビューター編に行ってきた"
pubDate: "Feb 12 2026"
emoji: "🦊"
tags: ["tech", "hono", "hackathon"]
draft: false
---

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">Hono Hackathonお疲れ様でした！！ <a href="https://twitter.com/hashtag/honohackathon?src=hash&amp;ref_src=twsrc%5Etfw">#honohackathon</a> <a href="https://t.co/5PPKu1Y1C8">pic.twitter.com/5PPKu1Y1C8</a></p>&mdash; Yusuke Wada (@yusukebe) <a href="https://twitter.com/yusukebe/status/2021514844546154994?ref_src=twsrc%5Etfw">February 11, 2026</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Hono Hackathonに行ってきたのでその感想を書いていく。

今回のハッカソンはアプリケーションを作るというより、Honoとその周辺ライブラリの開発に着目したイベントとなっていて、参加者は実際にHonoとその周辺ライブラリにPRを作成した。

始めにyusukebeさんが今回のイベントの説明と今日捌きたいissueを挙げて、参加者はそれらのissueのうち担当したいものを選んで取り組むという形で行われた。
PRを作成したらその場でyusukebeさんによるレビューが行なわれて、確認が終わったらその場でmergeされていた。
こういうオフラインならではのスピート感はなかなか見られないので面白いなと思ったりした。

## 実際に作成したPR

実際に作成したPRは以下。(テスト書き忘れたので後で追加する)

https://github.com/honojs/honox/pull/357

このPRはHonoXプロジェクトを本番ビルドした際に、islandではないコンポーネントに包まれたislandコンポーネントがハイドレーションされないという問題を修正するPRになっている。

issueはこちら

https://github.com/honojs/honox/issues/355

僕の方は、HonoX関連のissueに取り組むと決めたは良いものの、どのissueが良いか見極めきれずしばらくissueを物色していた。
ここで結構時間使っちゃったので、次回がある時は予めアタリは付けといた方が良かったなと。

HonoXのissue担当した人は3人いたのだけど、担当するissueがバッティングしないよう、ある程度取り組むissueに目処が付いた段階で他の2人に声をかけて、担当issueの擦り合せをした。

実際の作業について、まずissueにあるような問題が再現するかローカルにプロジェクトを作成して実際に動作を確認した。
問題が再現したので原因を探るべく、ソースコードを読んでいった。 この時にClaude
Codeが結構役立ったので、ありがたいな～と思ったり。

問題は本番環境かつisland関係なので、そのあたりのコードに原因があるのだろうとアタリを付けつつコードを読んでいった結果、`walkDependencyTree`という関数においてパス解決の際に使用する基準となるファイルが異っていることを発見した。
forkしたHonoXをローカルにcloneして、該当箇所を修正、問題を再現させたプロジェクトにて修正したHonoXを読み込ませて再度動作確認を行ったら問題が修正したのを確認できた。

今回は`package.json`にて`file:`を使って修正したライブラリの指定を行ったのだけど、正直これが正解だと思えてないので、問題を特定するための最小構成プロジェクトの作成だったり、修正したパッケージの動作確認とかについて懇親会で聞けば良かったなと若干の後悔がある...

## 開発環境

開発自体はEmacsでやろうとしたのだけど、最近Emacsでコードを書くと重くなる現象に悩まされてた[^1]のでNeovimで行った。

Neovimで開発するにあたって、LSPとGit、コーディングエージェントまわりの設定をしておいた方が良いなと思ったので、その調整とかをやっていた。
多分これに1.5時間くらい使ってたので、家でやっとけば良かったなと幾許かの後悔がある。
とはいえこういう時の設定が一番捗るんですよね...

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">honoxのバグ直しながらneovimの設定いじってるけど、こういう時の設定いじりが一番捗るんだよな</p>&mdash; こまもか🦊@シャニ∞th両日 (@Comamoca_) <a href="https://twitter.com/Comamoca_/status/2021486440056864870?ref_src=twsrc%5Etfw">February 11, 2026</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

導入したプラグインは以下。

- [snacks.nvim](https://github.com/folke/snacks.nvim)
- [neogit](https://github.com/NeogitOrg/neogit)
- [nvim-aibo](https://github.com/lambdalisue/nvim-aibo)

snacks.nvimはNeovim界隈で有名なfolkeさん作のプラグイン集で、mini.nvimに近いプラグイン。
僕はpickerとscratch
bufferだけ使ってたけど、他の機能も便利そうなので使ってみたい。

neogitはEmacsのmagit
likeなGitクライアントで、Emacsではmagitをよく使ってたので導入してみた。
操作感がmagitそのままだったのでこれからも使っていきたいところ。

aiboは周囲が良いと言っているのを聞きつつも触れてなかったので導入。
バッファにClaude Codeが表示されて、insert
modeに入ると画面下部にポップアップが表示される。
このポップアップに文字を入力して`:wq`するとClaude Codeに入力が渡される仕組み。

入力以外の操作は従来のバッファと同じなので、普段から慣れてる操作を一通り行なえる。
使った感触はめちゃくちゃ良くて、Neovimとコーディングエージェントを融合させる手段として一番良いのではないかと思っている。

## まとめ

今回は小さい変更とはいえ始めてHono関連のリポジトリにPR投げれて良かった。
HonoX自体はリリース初期に触って以降あまり見れていなかったのだけど、今回PRを投げるために色々触って浦島状態だったのと、実用性が上がっていると感じたので今後機会があったらまたいじってみたい。
あとNeovimの設定も結構捗ったのも嬉しい誤算だった。

コントリビューター向けのハッカソンイベントは今回参加してみて得られるものが多かったので、Honoに限らず今後もっと増えてくれれば良いなと。

[^1]: 恐らく描画まわりだと思うのだけれど、原因は未だに分かっていない...
