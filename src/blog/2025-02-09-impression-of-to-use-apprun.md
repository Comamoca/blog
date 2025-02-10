---
title: 'AppRunを使った所感'
description: 'さくらインターネットでβ版になってるAppRunの話'
pubDate: 'Feb 9 2025'
emoji: 🦊
tags: ["paas", "infra", "sakura-internet"]
draft: false
---

## AppRunっていうサービスがβ版で公開されていた

https://www.sakura.ad.jp/corporate/information/newsreleases/2025/02/04/1968218382/

ざっくり言うとGCPのCloud Runみたいなやつで、レジストリに登録したdocker
imageを良い感じに実行してくれる。

## とりあえずNginx

どんな感じかなと思いとりあえずNginxをデプロイしてみることにした。

さくらのコンテナレジストリからしかデプロイできないので、まずさくらのコンテナレジストリを作成する必要がある。

レジストリに関しては以下のサイトが分かりやすい。パスワードまわりは後のdocker
iamgeのpushで必要になるので、気を付けて設定する。

https://manual.sakura.ad.jp/cloud/appliance/container-registry/index.html?gad_source=1&gclid=CjwKCAiAwaG9BhAREiwAdhv6YwTjCqOSjP2ibxj00r0TEGmsC3JxIOe3EJoIMw3ne7IlCGUimnACeBoCx0oQAvD_BwE

上の記事にレジストリへのpushまで載っているので、そこまで作業を終わらせる。

次はAppRunのコンソールに移って、「アプリケーション作成」のボタンをクリック。
アプリケーション名とかよしな設定した後にコンテナ情報を設定する。

コンテナイメージは先程pushしたコンテナイメージを指定する。

あとは作成ボタンを押せばアプリが作成される。
アプリケーションがデプロイされるまで2,3分かかるのでしばらく待った後、ステータスが正常になっていればOK。
