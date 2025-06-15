---
title: 'Nix FlakeでGleam v1.11.1の開発環境を構築する'
description: 'Nix Flakeで最新のGleamを使った開発環境を作成する方法'
pubDate: 'Jun 15 2025'
emoji: 🦊
tags: ["gleam", "nix", "flake", "tips"]
draft: false
---

Gleamは様々なパッケージマネージャに対応していますが、Nixにおいては対応しているもののnixpkgsのパッケージがやや古いです。
これはGleam固有の問題というよりnixpkgsのあるあるみたいなものなので、手元で簡単に対応できるワークアラウンドとして最新のGleamをビルドするFlakeを紹介します。

なお、以下のFlakeは[devenv](https://devenv.sh/)というモジュールを使用しています。
devenvはFlakeで開発環境を構築する際に非常に便利なモジュールとなっているので、Flakeやflake-partsを使っているなら使うのをオススメします。

以下のFlakeでは開発環境としてGleamの他に実行するためのErlangパッケージを指定しています。
もしJavaScriptの開発環境が欲しかったら[JavaScript](https://devenv.sh/supported-languages/javascript/)を参考にJavaScript
Runtimeを適宜追加してください。

```flake
{
  description = "An simple flake for create gleam develop environment.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    devenv.url = "github:cachix/devenv";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs =
    inputs@{
      self,
      systems,
      nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devenv.flakeModule
      ];
      systems = import inputs.systems;

      perSystem =
        {
          config,
          pkgs,
          system,
          ...
        }:
        let
          rustPlatform = pkgs.makeRustPlatform {
	    cargo = pkgs.rust-bin.nightly.latest.default;
	    rustc = pkgs.rust-bin.nightly.latest.default;
           };

	  gleam = rustPlatform.buildRustPackage rec {
	    pname = "gleam";
		# Gleamのバージョン
	    version = "1.11.0";
	    src = pkgs.fetchFromGitHub {
	      owner = "gleam-lang";
	      repo = "gleam";
	      rev = "v${version}";
              # Gleamソースコードのハッシュ
	      hash = "sha256-oxzFAqPZ+ZHd/+GwofDg0gA4NIFYWi2v8fOjMn8ixSU=";
	    };

	    useFetchCargoVendor = true;
            # Gleamの依存ライブラリのハッシュ
	    cargoHash = "sha256-9kk7w85imYIhywBuAgJS8wYAIEM3hXoHymGgMMmrgnI="; 

	    auditable = false;
            doCheck = false;
	  };
        in
        {
          _module.args.pkgs = import inputs.nixpkgs {
              inherit system;
              overlays = [
		inputs.rust-overlay.overlays.default
              ];
              config = { };
            };

          devenv.shells.default = {
            packages = [ pkgs.nil ];

            languages = {
              gleam = {
                enable = true;
		package = gleam;
              };
              erlang = {
                enable = true;
              };
            };

            enterShell = '''';
          };

          packages.default = gleam;
        };
    };
}
```

今後Gleamのoverlayを開発する予定ではありますが、一先ずこのワークアラウンドを公開する事でお茶を濁すことにします...
