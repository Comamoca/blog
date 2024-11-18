---
title: 'JSRをスクレイピングする時のコツ'
description: 'JSRをfetchする時はヘッダーに気を付けよう'
pubDate: 'Nov 19 2024'
emoji: '🦊'
tags: ["tips"]
draft: false
---

リンクカードを実装する時にJSRだけ上手く情報を取得できなかったので、その解決方法を書いていく。

## JSRにリクエストを送る時はacceptヘッダーを付ける

これが全て。

JSRでは`https://jsr.io/@std/assert/meta.json`のように、ドキュメントのURLの末尾に`meta.json`を付けると、そのモジュールのメタデータが取れる。

つまり、`curl https://jsr.io/@std/assert/meta.json | jq '.name'{:sh}`なりすればブラウザを開かなくてもモジュールの情報を取得できる。

ただ、このノリでドキュメントのHTMLを取ろうとすると**404**が返却される。

```sh
curl https://jsr.io/@std/assert
404 - Not Found⏎
```

これを解決するには、acceptヘッダーを指定してやる必要がある。

```sh
curl https://jsr.io/@std/assert -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
```

このブログでも、linkcardの取得時にoriginがJSRの場合のみこのヘッダーを付加してリクエストを飛ばす処理が含まれている。

```ts
const resp = await fetch(req, {
  headers: isJSR
    ? {
      ...header,
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    }
    : header,
  signal: AbortSignal.timeout(timeout),
});
```

https://github.com/Comamoca/blog/blob/240a7edc3e194106377a110c3634d48593a213b5/utils/fetchogp.ts#L39-L48

この挙動はバグとして報告されているので、近い将来修正されるかもしれない。

https://github.com/jsr-io/jsr/issues/156
