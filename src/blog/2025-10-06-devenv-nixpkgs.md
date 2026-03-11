---
title: "devnevは独自のnixpkgsを持っている"
description: "普段は意識しないけど、エラー発生時に意識する必要があるかもしれない"
pubDate: "Oct 6 2025"
emoji: 🦊
tags: ["tech", "nix", "devenv"]
draft: false
---

## 結論

devenvをflakeで使っていて、nixpkgsのパッケージが消えたというエラーが出たらnixpkgsの参照が異なる可能性がある。
devenvは[devenv-nixpkgs](https://github.com/cachix/devenv-nixpkgs)を前提に書かれているので、そういうエラーが発生したらnixpkgsを切り替えると解決するかもしれない。

## 背景

個人的なflakeテンプレートとして[scaffold](https://github.com/Comamoca/scaffold/)というリポジトリがあるんですが、これは定期的に自動更新してlockfileが最新になるようにした。

いつものように`nix flake init`でテンプレートを引っ張ってきた時に、こんなエラーが発生した。

```
… while calling the 'derivationStrict' builtin
  at <nix/derivation-internal.nix>:37:12:
    36|
    37|   strict = derivationStrict drvAttrs;
      |            ^
    38|

… while evaluating derivation 'devenv-shell'
  whose name attribute is located at /nix/store/ybmnblw90230yl4p0l18ghwx9ry597bz-source/pkgs/stdenv/generic/make-derivation.nix:544:13

… while evaluating attribute 'DEVENV_PROFILE' of derivation 'devenv-shell'

… while evaluating the option `perSystem.x86_64-linux.devenv.shells.default.packages':

… while evaluating definitions from `/nix/store/85wf0pka5p7hbbfkyq78bxr61pfhpwsj-source/src/modules/languages/erlang.nix':

(stack trace truncated; use '--show-trace' to show the full, detailed trace)

error: 'erlang-ls' has been removed as it has been archived upstream. Consider using 'erlang-language-platform' instead
```

パッケージがrenameされたという旨のエラーなのだけど、これは2つの要素によって発生した。

まず、devenvが内部で持っている言語ごとの環境を定義するNixファイルにおいてerlnag-lsが参照されていた。
そのerlnag-lsパッケージですが、10/2に消されてerlang-language-platformの方に移動していた。

つまり、devenv側が存在しないパッケージを内部で参照していることによって発生した。

これはissueで報告されているかな、と思って探してみたけど見つからなかった。
これはおかしいな？と思い、tmpディレクトリで`devenv init`して生成されたflakeファイルを開いてみると、nixpkgsの項目に`github:cachix/devenv-nixpkgs/rolling`と指定されていた。

これはcachixがdevenv向けに提供しているnixpkgsで、devenvはこれを前提にflakeを吐いているらしかった。
普通にdevenv.nixを使用しているユーザーは出会さないけど、flakeからdevenvを使用しているユーザーはnixpkgsをNixOSの方に向けていることが多いと思うので、今後も遭遇する可能性はあるなと思った。
