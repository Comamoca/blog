---
title: "Waybar 動かない 解決方法"
description: "Waybaを起動してもタイムアウトする問題の解決方法"
pubDate: "May 11 2025"
emoji: 🦊
tags: ["nixos", "waybar", "linux", "xdg", "troubleshooting"]
draft: false
---

NixOSでWaybarを使っているとこんな感じのエラーが出て起動しない事がある。

```
[2025-05-11 00:58:56.976] [error] org.freedesktop.portal.Desktop を StartServiceByName で呼び出すときにエラーが発生しました: タイムアウトしました
```

(環境によっては英語で表示されることもある)

これがなかなかクセモノなトラブルなので解決方法をメモっておこうと思う。

## (暫定的な)解決方法

以下を実行し、`xdg-desktop-portal-gtk`を無効化する。

```
systemctl --user mask xdg-desktop-portal-gtk.service
```

## なぜこの方法で解決できるのか

`xdg-desktop-portal-gtk`は`xdg-desktop-portal`と併せて起動するプロセスなのだけど、これがいつからか起動に失敗するようになった。
これが失敗すると`xdg-desktop-portal`も巻き込まれて失敗するため起動できず、これらのサービスを使用するコマンド(この場合だとwaybar)も起動に失敗する。

なので`systemctl mask`を実行して一時的に`xdg-desktop-portal-gtk`を無効化すると`xdg-desktop-portal`が起動できるようになって、waybarが起動に失敗することもなくなる。

---

この手のエラーに出会したってあんまり聞いた事がないのだけど、これはNixOSを使っているからなのかそれともディストリ問わず発生するのかは分からない...
