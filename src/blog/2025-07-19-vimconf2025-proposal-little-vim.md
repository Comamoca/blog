---
title: "Little Vim"
description: "VimConf 2025 Smallのプロポーザルです。"
pubDate: "Jul 19 2025"
emoji: 🦊
tags: ["vimconf", "proposal"]
draft: false
---

## Abstract(日本語)

この講演の目的は、EmacsでVimのキーバインドをエミュレートするパッケージevilとVim本体のキーバインドを比較することであなたのVimキーバインドに対する理解を深めることです。
普段使っているキーバインドがどのように実装されているか、またそれによってどのような挙動をするかを解説します。ご存知のように、Vimの最も中核を担っていると言っても過言ではないVimキーバインドは、様々なエディタへ移植されています。
その代表例として、Emacsのパッケージevilを取り上げ、両者のVimキーバインドの実装方法の違いやそれによって生じる挙動の差、思想の違いなどを見ていきます。このセッションを聞いた後、Vimキーバインドとのより良い付き合い方のヒントを得ることができます。

## Abstract(ChatGPTによる英訳)

The goal of this talk is to deepen your understanding of Vim keybindings by
comparing how they are implemented in Vim itself and in Evil, the Emacs package
that emulates Vim's modal editing. We'll explore how the familiar keybindings
you use every day are structured under the hood and how those implementations
shape user experience. As you may know, Vim's keybinding model—arguably the
heart of the editor—is so influential that it's been ported to many other
environments. One of the most prominent examples is Evil for Emacs. This session
will examine the differences in implementation between Vim and Evil, the
resulting behavioral nuances, and the design philosophies behind them. By the
end of the talk, you’ll come away with insights into how to better leverage Vim
keybindings—whether inside or outside of Vim.

## Pitch

- VimとEmacs(evil)のVimキーバインドの実装の違いについて
- キーバインドの実装と挙動の差から見る両者のVimキーバイドへの考えの違いについて
- Vim以外のテキストエディタでVimキーバイドを使っている人へVimキーバインドとのより良い付き合い方のヒントを示す

## 対象者

- 普段何気なくVimキーバインドを使っている方
- VimではないエディタでVimキーバインドを使っている方

## 登壇者について

- 2022からVimを使っていて、ここ半年(プロポーザル執筆時点)はEmacsを使用している
- EmacsではVimキーバインドをエミュレートするevilを使用している
- Vimの設定が書ける

## 話そうと思っている事

- VimキーバインドとEmacs(evil)でのキーバインドの扱いの違い
- Vimキーバインドのエミュレーションから見るVimキーバイドの挙動について

## なぜ私が登壇しなくてはいけないのか？

- Vimを長年使用している経験と、Emacsでevilを使っている経験から、両者の挙動について話すことができる
- Emacsの経験も持っていることから、Vim以外のエディタの視点からVimキーバインドがどう見えるか話せる

## 懸念点

- VimConfという場においてEmacsの話が出てくるのはふさわしくないかもしれない
