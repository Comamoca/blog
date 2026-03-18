---
title: "ブログに寄付ボタンを設置してみた話"
description: "寄付ボタンとNostrについて"
pubDate: "Dec 19 2024"
emoji: 🦊
tags: ["release", "nostr"]
draft: false
---

このブログに寄付ボタンを設置してみたので、それについて紹介してみたいと思います。

記事の下部にko-fi/GitHub Sponsors/Nostr（zap）の3つのボタンを設置してみました。

当初はNostrのみだったのですが、それ単体だと一般向けではないと思ったのでko-fiを追加しました。
また、主に技術向けの情報を書いているのでその層向けにGitHub
Sponsorsを設置したという感じです。

ko-fiとGitHub Sponsorsはそれなりに認知度があると思います。
ですが、Nostrに関しては「Nostrって何？」もしくは「えっNostrってSNSじゃないの？」と思う方がいると思うので説明していきます。

## NostrのZapについて

NostrとはWebSocketとJSONをベースにした分散コミュニケーションのための**プロトコル**です。
SNSとしても使えるため、SNSとして紹介されることも多いですがそれは一部分に過ぎません。

プロトコルなのでいろいろな取り決め（NIP）があり、それらはコミュニティによって民主的に決められます。

たとえば、ブログのような長文のコンテンツを共有するためのNIP-23や、
ドメインを使用した本人確認のためのNIP-05などがあります。

NostrのZapはNIP-57で定められている、**Lightning
Networkを使用した送金のための仕様**になります。
Zapを使用することでNostr上での投稿に対してや、先述した長文コンテンツに対してBitcoinを送金できます。

このZapのしくみをWebページ上でも使えるようにできるのが[nostr-zap](https://github.com/SamSamskies/nostr-zap)です。
このボタンをサイトに設置することで、自身のLightning
Networkアドレスに送金するためのフォームを手軽に設置できます。

また、Zapは**誰がどのくらい送金したか**という情報を誰でも見られます。なのでその点において透明性があります。
これらの送金記録を確認できるフォームが[nostr-zap-view](https://github.com/Lokuyow/nostr-zap-view)になります。

nostr-zap-viewを設置することで、これらの情報を表示するウィジェットを簡単に設置できます。

昨今はWeb広告について何かと叫ばれますが、こういったZapによる収益化が広まっていってそれらの問題が解消する方向に進んでほしいなと思います。

Happy zapping!!
