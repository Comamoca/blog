---
title: 'OpenRouterとNixOSでclaude codeを使う'
description: 'OpenRouterのモデルでclaude codeを使う方法'
pubDate: 'May 30 2025'
emoji: 🦊
tags: ["ai", "claude code"]
draft: true
---

最近は[aidreを使ってコードを生成]()したりしてたけど、claude
codeが良いと噂を耳にしたので試してみることした。

ただ、claude codeはAntropicのAPIを使うのでAntropicに料金を払う必要がある。
この点で使うのに躊躇してたけど、[@ryoppippi](https://github.com/ryoppippi)さんが「プロシキ噛ませれば良いじゃん」と教えてくれたのでそれを試してみた。

結果上手く動いてるのでその内容をまとめていきたいと思う。

## 環境

- NixOS
- sops

sopsはMozillaが開発しているシンプルな暗号化ツール。

今回はsops(with
age)とnixを連携させるsops-nixを使ってキーを管理するのでこれが必要。
キー管理しない人は特に必要ない。

## 使うプロキシ

これを使う。

https://github.com/ujisati/claude-code-provider-proxy

claude
codeのプロキシ実装は色々あるのだけど、OpenRouterに対応しているのはこれしか見つけられなかった。

## とりあえず動かしてみる

READMEに書いてあるけど、`uv run ./src/main.py`すれば動く。
APIキーが必要なのでそれも合わせると以下のようなコマンドになる。

```
OPENAI_API_KEY=sk-hogefuga uv run ./src/main.py
ANTHROPIC_BASE_URL=http://localhost:8080 claude
```

`ANTHROPIC_BASE_URL=http://localhost:8080`は今後固定することになるのでシェルの設定に書いておくのが良い。

cludeに適当な質問をして回答が返ってくればOK。

## デーモンの設定

ここまで正常に動かせたら次はデーモンにしていく。
みんな大好きsystemdを使うのだけど、NixOSにはsystemdのunitファイルをNix式から生成できる機能がある。

これを使って設定していく。
`home.nix`に以下を記述する。`Environment`については後述する。

```nix
  systemd.user.services.claude-code-provider-proxy = {
    Unit = {
      Description = "Claude Code Provider Proxy";
      After = [ "network.target" ];
    };

    Service = {
      Type = "simple";
      WorkingDirectory = "path/to/claude-code-provider-proxy";
      ExecStart = "${pkgs.python3Packages.uv}/bin/uv run src/main.py";
      Restart = "on-failure";
      RestartSec = 10;
      Environment = "OPENAI_API_KEY=${builtins.readFile "${home.homeDirectory}/.secrets/openrouter"}";
    };

    Install = {
      WantedBy = [ "default.target" ];
    };
  };
```

## クレデンシャルの管理

ここからはオプションになるので、やりたくない方はやらなくても大丈夫。

先述の設定ではNix式にトークンにアクセスする箇所がある。
流石に直書きはマズいのでsopsとageで暗号化して保護する。

sopsとageを組合せると、sopsがファイル構造などを担当し暗号化をageで行なえる。
こうする事でpgpより安全で高速な暗号化が行える。

暗号化には様々なキーが使えるけれど、今回はPGP鍵を使う。
理由としては普段のGit署名としても使えるし、[なりすまし](https://www.takeokunn.org/posts/fleeting/20250528112340-setup_keyoxide/)されても本人であることを証明できるため。

まず始めに機密情報が書かれたファイルを用意する。

yamlファイルにしとくと何かと便利なので、今回はyaml形式で記述する。

```yaml
# secrets.yaml
openrouter: sk-hogefuga
```

作成したファイルをsopsで暗号化する。

```
```
