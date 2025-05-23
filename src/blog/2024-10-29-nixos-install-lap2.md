---
title: 2周目のNixOS
description: 2度目のNixOSインストールバトルで詰まりがちな部分のメモ
pubDate: Oct 29 2024
emoji: 🦊
tags: []
draft: false
---

NixOSをもう一度インストールする機会があったのでその際詰った部分の個人的メモ。
GUIのインストーラを使ってインストールして、その際生成された設定を使っているので、その想定で読んで欲しい。

## hardware-configuration.nixに含まれているUUIDに注意する

結論から言うと、**最悪NixOSの起動がStage 1から進まなくなる。**

NixOSのインストーラーは自動で設定ファイルを生成してくれる。
この設定ファイルは`/etc/nixos`配下に置いてあるので、これをコピーして設定している人も多いと思う。

問題はこの設定を用いて2度目のインストールを行なった際に発生する。
上記のような方法で設定を行なっている人の`hardware-configuration.nix`には`/dev/by-uuid/{uuid}`のようなPATHが含まれていると思う。

```nix
fileSystems."/" = {
    device = "/dev/disk/by-uuid/c6bcd4ba-1fa7-4d52-aa51-c692063690d7"; # <- これ
    fsType = "ext4";
  };
```

当然の事ながら、2度目のインストールの際は当然UUIDが異なっている。[^1]

これらのPATHはBootローダーのパーティションやNixOS本体が入っているパーティションが含まれているため、これらの設定を`nixos-rebuild switch`するとPATHが異なっているとOSが動作しなくなる。

根本的な解決方法としては、[disko](https://github.com/nix-community/disko)を用いて宣言的にパーティションを設定する方法がある。

しかし、今回は切羽詰まっていることもあり[^2]応急の策として初回起動時に`hardware-configuration.nix`の該当UUIDを自身のdotfilesにある`hardware-configuration.nix`のPATHへコピーして解決した。

## keybaseのログイン方法

`keybase login`を実行するとまずアカウント名を聞かれる。

その次に、**認証に使うデバイスを聞かれる**。これをミスると認証を待ってもなにも起こらなくて詰ったりするので気をつける。
個人的には普段使っているスマホがオススメ。カメラが使えるのでQRを読み込みやすい。

スマホ側で認証するデバイスの種類を選択する。するとカメラが起動するので、デバイスを選択した後に表示されているQRコードをスマホで読み込む。

もしこのQRコードが大きすぎて読み込みづらかったりした際は、QRコードの下に書かれているQRコードのPATH(/tmp配下.webp画像)を使ってブラウザなどで表示させる。

## keybaseのPGP importは全部同じフレーズを打つと間違いない

僕はkeybaseでGit認証を行なう為のPGP鍵を管理しているのだけど、keybaseのPGP鍵をpgpへとimportする手順が毎回分からなくなる。

具体的にはパスフレーズを求められた際にどのパスフレーズ(keybaseのアカウントのなのか、PGPのものか)か分からず混乱する。
そこで、パスフレーズを求められた際は**全て同じものを入力している**。

セキュリティ的によろしくないのは分かっているので勧めはしないけれど、keybaseのPGP管理で困っている人は参考にして欲しい。

[^1]: もしかしたら超人的な運でUUIDが衝突しているかもしれない。その場合は問題が発生しないはず。

[^2]: この作業を行なっている時はOSが起動しなくてかなり焦っていた。

[^3]: NixOSが前提なのでComputorで間違いないと思う
