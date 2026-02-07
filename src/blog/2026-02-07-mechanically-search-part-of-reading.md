---
title: "「の部分」を探索するプログラムの一部分"
description: "形態素解析を使っての部分を検索してみた"
pubDate: "Feb 7 2026"
emoji: 🦊
tags: ["tech"]
draft: true
---

てれかくしを見ながらコード書いてたら「の部分」の話が出てきたので、休憩がてら簡易的に「の部分」を探索する簡単なプログラムを書いてみた。
「の部分」については以下の記事が詳しい。この記事では以降「の部分」を部分ネタとして表記する。

https://dic.nicovideo.jp/a/%E2%97%8B%C3%97%C3%97%E2%97%8B%E3%81%AE%C3%97%C3%97%E3%81%AE%E9%83%A8%E5%88%86%28%E8%A8%80%E8%91%89%E9%81%8A%E3%81%B3%29

## 部分ネタをコードの問題として考えてみる

部分ネタは文章の読みの一部から別の意味を持つ単語だったり文章を切りだすもの。
なので、まずはそれぞれの文章の読みを正規化する必要がある。

そこで使用するのがみんな大好き形態素解析。これを使えば辞書を用いて日本語文字列からその読みを逆引きできる。
形態素解析を行えるライブラリはいくつかあるけど、僕はgoyaがお気に入りなのでそれを使う。

以下がプログラムの全文。サンプルは先述したニコニコ大百科の記事から取ってきている。

```ts
import core from "goya-core";
import { get_features } from "goya-features";

const bubun_lists = [
  ["情報保護", "ウホウホ"],
  ["みたらし団子", "acid"],
  ["海外に移住", "I need you"],
  ["はらぺこあおむし", "コアを無視"],
  ["卒業証書", "ウショウショ"],
  ["たこわさ", "怖さ"],
  ["175センチ以下は低身長", "ちいかわ"],
  ["東京理科大学", "課題が苦"],
  ["2時間飲み放題", "菅野美穂"],
  ["北海道大学", "移動代が苦"],
  ["富士急ハイランド", "時給はいらん"],
];

const extract_yomi = (text) => {
  const lattice = core.parse(text);
  lattice.wakachi();

  const INDEX_POS = 7;

  const morphemes = lattice.find_best();
  const features = get_features(morphemes.map((morph) => morph.wid));
  get_features([morphemes[0].wid]);

  const yomi = morphemes.map(({ surface_form }, i) => {
    const feature = features[i];
    return feature[INDEX_POS];
  }).join("");

  return yomi;
};

bubun_lists.forEach((bubun_text) => {
  const [text, bubun] = bubun_text;
  const text_yomi = extract_yomi(text);
  const bubun_yomi = extract_yomi(bubun);

  // 読みが存在しない文字列はそのまま検索する
  if (bubun_yomi) {
    console.log(
      `${bubun} in ${text}(${text_yomi}) => ${text_yomi.includes(bubun_yomi)}`,
    );
  } else {
    console.log(
      `${bubun} in ${text}(${text_yomi}) => ${text_yomi.includes(bubun)}`,
    );
  }
});
```

出力される文字列は以下になる。

```
ウホウホ in 情報保護(ジョウホウホゴ) => true
acid in みたらし団子(ミタラシダンゴ) => false
I need you in 海外に移住(カイガイニイジュウ) => false
コアを無視(コアヲムシ) in はらぺこあおむし(ハラアオムシ) => false
ウショウショ(ウシ) in 卒業証書(ソツギョウショウショ) => true
怖さ(コワサ) in たこわさ(タコワサ) => true
ちいかわ(チイカワ) in 175センチ以下は低身長(センチイカハテイシンチョウ) => false
課題が苦(カダイガニガ) in 東京理科大学(トウキョウリカダイガク) => false
菅野美穂(カンノミホ) in 2時間飲み放題(ジカンノミホウダイ) => true
移動代が苦(イドウダイガニガ) in 北海道大学(ホッカイドウダイガク) => false
時給はいらん(ジキュウハイラン) in 富士急ハイランド(フジキュウハイランド) => true
```

この出力から分かるように、このプログラムは完璧に部分ネタを探索できるものではない。
主な理由としては、「acid」のような英単語は辞書に含まれていないこと、「移動代が苦」のように期待通り読みが正規化されていないことが挙げられる。

対策としては、英単語の読みを含めた辞書を作成すること、形態素解析を行う際に複数の読みも取得できるため、それらの組み合わせでも探索することが挙げられる。
今回は簡易的なコードだけれど、本気で部分ネタを探すならそのあたりの探索を行ったコードを書く必要があると思う。
