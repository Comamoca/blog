---
title: ブログを自作した話
description: ブログを自作した動機や使用した技術について
pubDate: Apr 08 2023
emoji: 🦊
draft: false
---

## ブログを初めた話

以前から Zenn などに記事を投稿していたけれど、Zenn
に投稿出来るレベルではないと感じた記事などを
供養する場所が欲しくなったので、自分のブログを自作してみました。

## 開発の話

このブログは Astro で開発されていてホスティングは CloudFlare Pages
で行なっています。 また、画像は CloudFlare R2
で配信する事によって読込みの高速化を図っています。

R2
での画像配信では、独自のアップローダーを自作することにより画像のアップロードをしやすくしています。

アップローダーはまだ外部に公開できるクウォリティーに達していないと判断したので、追々公開していきたいと考えてます。
