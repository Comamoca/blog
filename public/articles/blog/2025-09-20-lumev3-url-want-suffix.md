---
title: "Lume v3ではURLを拡張子まで指定しよう"
description: "CloudFlareにLumeをデプロイする時、URLに拡張子を明示しないとMIME Typeがおかしくなる"
pubDate: "Sep 20 2025"
emoji: 🦊
tags: ["lume", "cloudflare"]
draft: false
---

## 結論

Lumeでページに[URL](https://lume.land/docs/creating-pages/urls/)を指定する際は、拡張子まで明示しよう。

## 発生した不具合について

最近Lumeをv3までアップデートしたのだけど、[/me](https://comamoca.dev/me)と[/info](https://comamoca.dev/info)だけHTMLではない形式で扱われていて、本来のページが表示されなくなっていた。

開発者ツールで内容を見てみると、`text/html`ではない`content-type`が指定されていてた。
不思議に思ってClaudeとかに聞いてみたところ、CFが誤ってコンテンツを認識しているからという回答が得られた。

そんな変なことしたのかな〜と思ってDashboardとか見てまわったのだけど、怪しい設定などもなく悩んでいた。
そんな折、cloud
codeで該当のページのファイルも含めて質問してみたらこんな感じの回答が返ってきた。

- urlに拡張子が指定されていないせいで拡張子のないHTMLが生成されていた
- CFは拡張子がないファイルに対して自動でContent Typeを判定する
- その判定がHTML以外になっているのではないか

という結論になった。

実際にこのcommitで直したら正しく表示されるようになった。

https://github.com/Comamoca/blog/commit/c7e3074f5628d08fea72fa122f15448fa8cc3d7a
