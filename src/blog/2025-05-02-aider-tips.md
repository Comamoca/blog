---
title: 'aiderを使っている'
description: 'aiderを使ってみての実戦よりな知見をまとめてみる'
pubDate: 'May 2 2025 '
emoji: 🦊
tags: []
draft: false
---

社会人になって個人開発に割く時間がかなり減ったのを痛感している。

そんな中、最近は開発時間を圧縮できないかとAIコーディングを試しているので、その際得られた知見をメモしていた。

本当はZennに上げたいけど、体裁を整えると時間がかかるのでとりあえず個人ブログに残すことにした。

## 前提

### モデル

Geminiを使っている。理由は安いから。
課金もしているけど、**Tier1の現状で今まで100円を超えたことがない**。

最近はすぐレートリミットに到達してしまうので、ドキュメントを見てレートについて調べてたんだけど、開発に影響が出ない150RPM以上のレートでGeminiを使えるようにするにはTier1(いわゆる通常の課金)を行う必要があるらしい。

Geminiは性能がイマイチな印象が結構あると思うけど、実際触ってみるとOpanAIのモデル程じゃないにしてもそこそこ使えるなという感触がある。

Flashはとにかく応答が速いけど、かなりアホの子なので`weak-model`として使うと良さそう。

5/2現在`Gemini 2.0 Flash (Image Generation) Experimental`

### エディタ

Emacsを使っている。理由は便利だから。
後述するけど、aiderとEmacsを連携させるためのパッケージとしてaider.elを使っている。

## エディタで使う

`aider --watch-files`で起動する。
コードに`AI`や`AI!`、`AI?`で終わるコメントを記述する。
コメントの内容に応じてaiderがコードを編集する。

- `AI!`はコードを編集
- `AI?`はコメントの質問に回答
- `AI`はaiderに注目させるために使う。最後に`AI!`を付けるとまとめて適用できる。
  また、`AI`コメントは`/add`コマンドでファイルを追加する操作と同等。
  これらのキーワードは`ai`や`ai!`、`ai?`など小文字でも認識する。

**これらのキーワードは一行コメントの末尾でしか認識しないので注意**。

## コマンド

チャット内でコマンドを使うことでエージェントに的確な指事を行える。
コマンドは`/`から始まる。

- /chat
チャットモード

- /archtect
アーキテクトモード

- /run
コマンド実行

みたいな感じ。

使用できるコマンドは [In-chat commands](https://aider.chat/docs/usage/commands.html) に書いてある。

## 設定

yamlを用いてaiderの設定ができる。(.aider.conf.yml) ->
書くの面倒なのでNixで書いてyamlを生成したい

## FAQ

### clinerulesみたいな事がしたい

`.aider.conf.yml`に以下の設定を書くと読み取り専用ファイルとしてコンテキストに追加される。

```yaml
read:
  - .aiderrules
  - README.md
```

ここに`.aiderrules`を追加することで疑似的にclineっぽい挙動が可能。
これについては(https://github.com/Aider-AI/aider/issues/1293)[issue]にも書いてある。

プロジェクト構造を変更した後に更新し忘れる事がままあるので、「.aiderrulesの内容と現在のプロジェクトを比較し、異なっている箇所を列挙してください」
みたいなプロンプトを定期的に実行したほうが良いかもしれない。

#### プロンプトについて

一般的にここに書く文章は英語の方が良いらしい。

僕はプロジェクトで使用するツールについての情報や、実行する指事について書いている。
例えば、aiderはPythonプロジェクトだとデフォルトでlintに`flake8`を使うのだけど、僕は専らruffを使っているので
それに関する指事を書いたりしている。

aiderは自動的にlint, format,
コードのデバッグ実行を行うので、それに関する情報を盛り込んでおくとかなり捗る。
`Comamoca/tourmas-datarepo`にはこんな感じのルールを書いている

> 回答は必ず日本語でお願いします。
>
> このプロジェクトではuvを採用しています。
> Pythonスクリプトを実行する際は`./validators/`配下にて`uv run`コマンドを先頭に付けてpythonを実行してください。
>
> また、新たにPythonパッケージをインストールする際は`./validators/pyproject.toml`の`dependencies`を編集した後、`./validators/`ディレクトリにて`uv sync`を実行してください。
>
> このプロジェクトではlinterにflake8ではなくruffを採用しています。
> lintを実行する際は`ruff check`コマンドを実行してください。

プロンプトに関しては[mizchi](https://github.com/mizchi/ailab/blob/main/.clinerules)さんの`.clinerules`がかなり良い感じなのでここで紹介する。

## Tips

[ドキュメント](https://aider.chat/docs/usage/tips.html)に書いてあるTipsについて。

### 目標を段階的に分割する

一度に 1
つずつ実行しる。作業を進めるにつれて、チャットに追加するファイルを調整しる。変更が不要になったファイルは
`/drop` で削除し、次のステップで変更が必要なファイルは `/add` で追加。

### 複雑な変更については、最初に計画を立てる

`/ask` コマンドを使用して、aider と計画を立てる。アプローチに満足したら、`/ask`
プレフィックスなしで「go ahead」と言うだけで実行できる。

### aiderが行き詰まった場合

- `/clear` を使用してチャット履歴を破棄し、再起動する。
- 不要なファイルがあれば `/drop` で削除する。
- コード編集を開始する前に、`/ask` を使用して計画を話し合う。
- `/model` コマンドを使用して別のモデルに切り替え、再度試行。GPT-4o と Sonnet
  の切り替えが良いらしい。
- 完全に動かなくなった場合は、自分でコードを書いた後再度やらせる。

### 新しいファイルを作成する

`/add <ファイル>` で追加できる。

### バグとエラーを修正する

エラーが起こったら`/run` コマンドを使用してエラー出力をaiderに送る。
テストが失敗する場合は、`/test` コマンドを使用してテストを実行し、エラー出力を
aider と共有する。

### ドキュメントを提供する

URLを貼り付けると自動でサイトを読み込みコンテキストに追加する。
`/read`を使うとローカルのファイルを読み込める。

## 通知

`--notifications`オプションをつけるとLLMが応答を待っている時に通知が送信される。

macOSでは`terminal-notifier` Linuxでは`notify-send`と`zenify`
WindowsではPowerShell

がそれぞれ使われる。

## ブラウザ

`--browser`オプションを指定すると実験的なブラウザUIが起動する。

## クリップボード

### コンテキストのコピー

`/copy-context <instructions>`でaiderが保持しているコンテキストをコピーできる。

### 貼り付け

`/paste`でクリップボードのテキストをaiderへと貼り付けられる。

### 自動読み取り

`--copy-paste`オプションを指定するとクリップボードにテキストがコピーされた時に自動的にaiderのチャットへと貼り付けられる。
他のLLMとやり取りをするのが多い際に便利。

## モデルの設定

### トークンの制限

`.aider.model.metadata.json`をホームディレクトリかプロジェクトルートに作成するとトークン数の制限などが可能になる。
設定は以下のように行う。
[該当ドキュメント](https://aider.chat/docs/config/adv-model-settings.html)

```json
{
  "deepseek/deepseek-chat": {
    "max_tokens": 4096,
    "max_input_tokens": 32000,
    "max_output_tokens": 4096,
    "input_cost_per_token": 0.00000014,
    "output_cost_per_token": 0.00000028,
    "litellm_provider": "deepseek",
    "mode": "chat"
  }
}
```

### weak-model

aidreはコードを編集する際に**自動的にcommitを行う**。
この時コミットメッセージを生成するのに使われるのがweak-model。
commitメッセージの生成は比較的コードの生成より求められる能力が低いので、そこに
廉価なモデルを割り当てることでコストの削減が期待できる。

## Emacsで使う

ここではEmacs固有の設定などを解説する。

### どのプラグインを使うべきなのか

[aider.el](https://github.com/tninja/aider.el)と[aidermacs](https://github.com/MatthewZMD/aidermacs)がある。
どちらも機能に大差はないが、aider.elの方が勢いがあるように見える。
また、aider.elはaiderとの対話にcomint-modeを使用するが、aidermacsはオプションでvtermが使える。
ファンシーな見た目で対話したかったらaidermacsの方がいいかもしれない。

僕は以前までaidermacsを使っていたけど今はaider.elを使っている。
後述する--watch-files等の問題が解決しているように見えるのと、

### 認証情報について

Emacsでは組み込みでauth-infoという認証情報を管理する仕組みが備わっている。
aidermacsではこのauth-infoを用いて認証情報を取得する。

auth-infoは`~/.emacs.d/auth-info`ファイルに**netrc形式で**パスワードを書いて利用する。
もしPGP鍵を持っているのなら、暗号化を有効にできるので暗号化を行うのを**強く推奨する**。

### --watch-filesオプションが有効にならない場合

aidermacsなどaiderをEmacsから使用している際に`--watch-files`オプションが効かない事がある。[該当issue](https://github.com/MatthewZMD/aidermacs/issues/96)
これは`TERM=DUMB`に関連する設定が影響している。

aiderを起動する際に`TERM=dumb aider --watch-files`のようにして起動するか、`comint-terminfo-terminal`に`eterm-color`を指定する。
またはaiderの起動コマンドに`--no-pretty`と`--no-fancy-input`を追加すると解消できる可能性がある。

## 編集形式

aiderがコードを編集する際に使う形式について。

- whole
- diff
- diff-fenced
- udiff
- editor-diff
- editor-whole

の形式がある。
aiderは自動で最適な編集形式を選択するが、`--editor-edit-format`オプションで変更可能。

### whole

最も単純な編集形式。
ファイルの内容の**全てをコピー**し、変更した結果を返す形式。
比較的高い精度が出やすい形式だがファイルが大きいと時間がかかるようになる。

### diff

git mergeと同じ形式を使ってファイルを変更する部分のみを返す形式。
変更した箇所のみ返すので効率的。

### diff-fenced

主にGeminiで使用される形式。 ファイルパスがコードブロックの中に入る。
diff形式との互換性はない。

### udiff

広く使われているdiff形式である統合diff形式を使用している。(いわゆる普通のdiff)
シンプルなのが特徴。 GPT-4o Turboが使っていた。

### editor-diffとeditor-whole

architect modeで使われる形式。
どのファイルを変更するべきかに集中したプロンプトを使用する。

## ドキュメントを読んでいて面白そうだと思った機能

### Scripting aider

shellやPythonからaiderを呼び出す方法が載っている。[該当ページ](https://aider.chat/docs/scripting.html)

- `--message`オプション
  対話型ではなく一度の指示で一つの動作をさせるというもの。シェル芸でやっていた雑用がちょっと楽になりそう。

- Pythonライブラリ
  aiderの機能をPythonから呼び出せる。aiderベースのエディタを作る時とかに良さそう？

### archtect mode

推論と編集でモデルを分けて使用するモードらしい。
モデルを複数使用するため料金はかさむがより良い結果が得られるとか。

[^1]: 5/2現在はプレビュー版となっている。
