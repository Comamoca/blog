{
  description = "A basic flake to with flake-parts";

  inputs = {
    # nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    nixpkgs.url = "github:NixOS/nixpkgs/master";
    # gleam用 (og workerはGleam >= 1.14を要求。rootのnixpkgsピンは古いため)
    nixpkgs-latest.url = "github:NixOS/nixpkgs/nixos-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    llm-agents.url = "github:numtide/llm-agents.nix";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
    deno-overlay.url = "github:haruki7049/deno-overlay";
    mcp-servers-nix = {
      url = "github:natsukium/mcp-servers-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      systems,
      nixpkgs,
      treefmt-nix,
      flake-parts,
      git-hooks-nix,
      llm-agents,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
      ];
      systems = import inputs.systems;

      perSystem =
        {
          self,
          config,
          pkgs,
          lib,
          system,
          git-hooks,
          ...
        }:
        let
          stdenv = pkgs.stdenv;
          deno-latest-version = "2.4.5";
          deno = pkgs.deno."${deno-latest-version}";

          # libPath = pkgs.lib.makeLibraryPath (pkgs.lib.getLib stdenv.cc.cc);
          # libPath = "${pkgs.lib.getLib stdenv.cc.cc}"/lib;

          wrangler-pkgs = import (builtins.fetchTarball {
            url = "https://github.com/NixOS/nixpkgs/archive/21808d22b1cda1898b71cf1a1beb524a97add2c4.tar.gz";
            sha256 = "sha256:0v2z6jphhbk1ik7fqhlfnihcyff5np9wb3pv19j9qb9mpildx0cg";
          }) { inherit system; };

          wrangler = wrangler-pkgs.wrangler;

          fonts = stdenv.mkDerivation {
            pname = "noto-cjk";
            version = "2.003";
            src = pkgs.fetchzip {
              name = "noto-cjk";
              url = "https://github.com/notofonts/noto-cjk/releases/download/Sans2.004/06_NotoSansCJKjp.zip";
              hash = "sha256-QoAXVSotR8fOLtGe87O2XHuz8nNQrTBlydo5QY/LMRo=";
              stripRoot = false;
            };

            buildPhase = ''
              mkdir -p $out/bin

              cp NotoSansCJKjp-Regular.otf $out/bin
              cp NotoSansCJKjp-Bold.otf $out/bin
              cp NotoSansCJKjp-Black.otf $out/bin
            '';
          };

          textlintrc = (pkgs.formats.json { }).generate "textlintrc" {
            filters = { };
            rules = {
              preset-ja-technical-writing = {
                ja-no-weak-phrase = false;
                ja-no-mixed-period = false;
                no-exclamation-question-mark = false;
              };
              prh = {
                rulePaths = [
                  "${pkgs.textlint-rule-prh}/lib/node_modules/textlint-rule-prh/node_modules/prh/prh-rules/media/WEB+DB_PRESS.yml"
                  "${pkgs.textlint-rule-prh}/lib/node_modules/textlint-rule-prh/node_modules/prh/prh-rules/media/techbooster.yml"
                ];
              };
            };
          };

          deno-test = pkgs.writeShellApplication {
            name = "deno-test";
            runtimeInputs = [ deno ];
            text = ''
              # Pre-cache dependencies to avoid network issues during build
              if ! ${deno}/bin/deno cache tests/*.ts 2>/dev/null; then
                echo "Warning: Could not cache test dependencies, skipping deno test in offline environment"
                exit 0
              fi
              ${deno}/bin/deno test --allow-env --allow-read --allow-run --allow-write --no-prompt
            '';
          };

          ruby' = pkgs.ruby_3_4.withPackages (ps: [
            ps.thor
          ]);

          create = pkgs.stdenv.mkDerivation {
            pname = "create";
            version = "1.0";

            src = ./create.rb;
            dontUnpack = true;

            nativeBuildInputs = [
              pkgs.makeWrapper
            ];

            installPhase = ''
              mkdir -p $out/bin
              makeWrapper ${ruby'}/bin/ruby $out/bin/create \
                --add-flags $src
            '';
          };
        in
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            config.allowUnfreePredicate =
              pkg:
              builtins.elem (lib.getName pkg) [
                "claude-code"
              ];
            overlays = [
              inputs.deno-overlay.overlays.deno-overlay
              inputs.llm-agents.overlays.shared-nixpkgs
            ];
            config = { };
          };

          treefmt = {
            projectRootFile = "flake.nix";
            settings.excludes = [ ".commandcode/**" ];
            programs = {
              nixfmt.enable = true;
              deno = {
                enable = true;
                package = deno;
              };
              rufo.enable = true;
            };
            settings.formatter = { };
          };

          pre-commit = {
            check.enable = true;
            settings = {
              hooks = {
                treefmt = {
                  enable = true;
                  language = "system";
                  pass_filenames = false;
                };
                gitleaks = {
                  enable = true;
                  entry = "${pkgs.gitleaks}/bin/gitleaks protect --staged";
                  language = "system";
                };
                gitlint.enable = true;
                deno-test = {
                  enable = true;
                  name = "deno-test";
                  entry = "${deno-test}/bin/deno-test";
                  language = "system";
                  # tests/ 配下の変更時のみ実行(全コミットでフルテストが走るのを防ぐ)
                  files = "^tests/";
                  types = [ "text" ];
                };
              };
            };
          };

          # When execute `nix develop`, you go in shell installed nil.
          devShells.default =
            let
              # gleam/nodejsはoverlay (deno-overlay / llm-agents) 非適用の
              # クリーンなnixpkgsから取得する (overlay適用下では評価が壊れるため)
              clean-pkgs = import inputs.nixpkgs { inherit system; };
              latest-pkgs = import inputs.nixpkgs-latest { inherit system; };
              mcp-config = inputs.mcp-servers-nix.lib.mkConfig pkgs {
                settings.servers = { };
                programs = {
                  # playwright.enable = true;
                };
              };
            in
            pkgs.mkShell {
              inputsFrom = [ config.pre-commit.devShell ];
              packages = with pkgs; [
                (textlint.withPackages [
                  textlint-rule-preset-ja-technical-writing
                  textlint-rule-prh
                ])

                vips
                stdenv.cc.cc

                # deno."1.28.0"
                # deno."2.4.5"
                deno
                bun
                wrangler
                latest-pkgs.gleam
                clean-pkgs.nodejs

                nil
                lua-language-server
                efm-langserver
                # nodePackages_latest.typescript-language-server
                # ruby-lsp
                tailwindcss-language-server
                marksman

                just
                nushell
                git
                git-secrets
                unar

                # deploy
                wrangler

                # llm-agents.claude-code
                # llm-agents.agent-browser
                llm-agents.packages.x86_64-linux.claude-code
                llm-agents.packages.x86_64-linux.agent-browser

                create
              ];

              # LD_LIBRARY_PATH = "${libPath}/lib";
              # LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";

              LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc ]}";

              shellHook = ''
                	      [ -e ./fonts ] && rm -r ./fonts
                              mkdir -p ./fonts/noto-fonts

                              [ -f .textlintrc ] && rm .textlintrc
                              ln -s ${textlintrc} .textlintrc

                              ln -s ${fonts}/bin/NotoSansCJKjp-Regular.otf ./fonts/noto-fonts/NotoSansCJKjp-Regular.otf
                              ln -s ${fonts}/bin/NotoSansCJKjp-Bold.otf ./fonts/noto-fonts/NotoSansCJKjp-Bold.otf
                              ln -s ${fonts}/bin/NotoSansCJKjp-Black.otf ./fonts/noto-fonts/NotoSansCJKjp-Black.otf


                              ${pkgs.git-secrets}/bin/git-secrets --add '^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z0-9]{4}$'

                  if [ -L ".mcp.json" ]; then
                    unlink .mcp.json
                  fi
                  ln -sf ${mcp-config} .mcp.json
              '';
            };

          # OG Worker (og/) 用フォント。design.md「フォント戦略」の通り、
          # Noto Sans CJK JP フルOTF (~16MB×2) をブログ記事のtitle/description
          # コーパス+基本的な仮名/半角全角/約物レンジでサブセットし、
          # og/static/fonts/ にコミットする素材を生成する
          # (`nix build .#og-fonts` → 結果を og/static/fonts/ にコピー)。
          # ブログ記事が増えたら再実行してコーパスを更新する。
          packages.og-fonts =
            let
              clean-pkgs = import inputs.nixpkgs { inherit system; };
              subsetter = clean-pkgs.python3.withPackages (ps: [ ps.fonttools ]);
              # 実描画に載る固定文字列 (og_worker/card.gleam の site_title 等) と
              # golden/komeijiテストの固定入力。ブログ本文のコーパスだけでは
              # 拾えない文字を保証する
              extraCorpus = pkgs.writeText "og-fonts-extra-corpus.txt" ''
                かわいい駆動生活。
                GleamとCloudflare WorkersでOG画像を動的生成する
                LustreでHTMLを組み立て、komeijiでSVGに変換し、resvg-wasmでPNGへ描画します。この説明文は折り返しの確認用にやや長めにしています。日本語のテキストがカードの幅に収まることを確認してください。
                こんにちは
                説明
                Gleam入門
                説明文
                無視されるタイトル
                a<b&c>
                &amp;
                0123456789
                og.comamoca.dev
                comamoca.dev
              '';
            in
            pkgs.stdenv.mkDerivation {
              pname = "og-fonts";
              version = "1.0";

              src = ./src/blog;
              dontUnpack = true;

              buildPhase = ''
                runHook preBuild

                mkdir -p $out

                # 記事のtitle/descriptionフロントマターを抽出してコーパスにする
                # (og_metas/card.gleamが実際にレンダリングするテキストはこの2フィールドのみ)
                for f in $src/*.md; do
                  awk "
                    /^---\$/ { fm = !fm; next }
                    fm && /^(title|description):/ {
                      sub(/^(title|description):[ \t]*/, \"\");
                      print
                    }
                  " "$f" >> corpus.txt
                done
                cat ${extraCorpus} >> corpus.txt

                for weight in Regular Bold; do
                  ${subsetter}/bin/pyftsubset ${fonts}/bin/NotoSansCJKjp-$weight.otf \
                    --text-file=corpus.txt \
                    --unicodes="U+0020-007E,U+00A0-00FF,U+2000-206F,U+3000-303F,U+3040-309F,U+30A0-30FF,U+FF00-FFEF" \
                    --output-file=$out/NotoSansJP-$weight.ttf \
                    --layout-features='*' \
                    --glyph-names \
                    --symbol-cmap \
                    --legacy-cmap \
                    --notdef-glyph \
                    --notdef-outline \
                    --recommended-glyphs \
                    --name-legacy \
                    --recalc-bounds \
                    --recalc-timestamp \
                    --canonical-order
                done

                runHook postBuild
              '';

              installPhase = "true";
            };

          # Minimal shell for CI builds: only what `deno task build` and
          # `wrangler pages deploy` need, so CI doesn't pay for editor
          # tooling (LSPs, textlint, claude-code, agent-browser, ...).
          devShells.ci = pkgs.mkShell {
            packages = with pkgs; [
              vips
              stdenv.cc.cc
              deno
              wrangler
            ];

            LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc ]}";

            shellHook = ''
              [ -e ./fonts ] && rm -r ./fonts
              mkdir -p ./fonts/noto-fonts

              ln -s ${fonts}/bin/NotoSansCJKjp-Regular.otf ./fonts/noto-fonts/NotoSansCJKjp-Regular.otf
              ln -s ${fonts}/bin/NotoSansCJKjp-Bold.otf ./fonts/noto-fonts/NotoSansCJKjp-Bold.otf
              ln -s ${fonts}/bin/NotoSansCJKjp-Black.otf ./fonts/noto-fonts/NotoSansCJKjp-Black.otf
            '';
          };
        };
    };
}
