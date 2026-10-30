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
            url = "https://github.com/NixOS/nixpkgs/archive/a7868a727837f3c09cee2ce0ca671c76b1589fed.tar.gz";
            sha256 = "sha256-KgItSKML8Xvte0B7/uGnBDsYzSnnKHcOaiUbgWBXLXw=";
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

          # pre-commit用テストランナー。実行入口は package.json の test
          # script (= `vp run test` → `vp test`) に一本化し、ここはその
          # ラッパーになるだけにする (テストの起動方法を変える唯一の場所)。
          # テストはDenoからVitestへ移行したため依存の事前キャッシュは不要
          # (vp test はプロジェクトの node_modules を直接使う。vp は flake の
          # vite-plus パッケージ由来でnode_modulesの状態に左右されない)。
          vitest-test = pkgs.writeShellApplication {
            name = "vitest-test";
            runtimeInputs = [ vite-plus ];
            text = ''
              ${vite-plus}/bin/vp test
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

          # OG Worker (og/) 用フォント。design.md「フォント戦略」の通り、
          # Noto Sans CJK JP フルOTF (~16MB×2) を固定の文字集合でサブセットする。
          #
          # 文字集合はブログ記事に依存させない:
          #   - og/data/charset-ranges.txt: 仮名/約物/ラテン/ギリシャ/記号のレンジ
          #     (pyftsubset の --unicodes にそのまま渡す)
          #   - og/data/jisx0208-kanji.txt: JIS X 0208 (第1・第2水準) の漢字全字
          # 以前は記事の #+TITLE: / #+DESCRIPTION: をコーパスとして混ぜていたが、
          # それだと記事を1本足すだけで導出物が変わってOG Workerの再ビルド・
          # 再デプロイが走ってしまう。記事が集合外の文字を使った場合は
          # tests/og_charset_test.ts がPR時に落ちるので、そこで
          # charset-ranges.txt に追記する (= フォントが変わって再デプロイされる)。
          # `nix build .#og-fonts` で単体生成できる他、devShells.default の
          # shellHook / CIの test-og ジョブから og/static/fonts/ へ配置される
          # (gitにはコミットしない)
          ogFonts =
            let
              clean-pkgs' = import inputs.nixpkgs { inherit system; };
              subsetter = clean-pkgs'.python3.withPackages (ps: [ ps.fonttools ]);
            in
            pkgs.stdenv.mkDerivation {
              pname = "og-fonts";
              version = "2.0";

              # 入力は文字集合データだけに絞る。og/data を丸ごと src にすると
              # README を直しただけで導出のストアパスが変わり、再ビルド扱いに
              # なってしまう
              src = lib.fileset.toSource {
                root = ./og/data;
                fileset = lib.fileset.unions [
                  ./og/data/charset-ranges.txt
                  ./og/data/jisx0208-kanji.txt
                ];
              };
              dontUnpack = true;

              buildPhase = ''
                runHook preBuild

                mkdir -p $out

                for weight in Regular Bold; do
                  ${subsetter}/bin/pyftsubset ${fonts}/bin/NotoSansCJKjp-$weight.otf \
                    --text-file=$src/jisx0208-kanji.txt \
                    --unicodes="$(cat $src/charset-ranges.txt)" \
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

                # 文字集合に載っているコードポイントが実際にサブセットへ入った
                # ことを確認する。元フォント (Noto Sans CJK JP) が持たない文字を
                # charset-ranges.txt に足すと、pyftsubset は黙って捨てるため
                # OGP が豆腐になる。ここで落とせばデータ側の誤りに気付ける。
                for weight in Regular Bold; do
                  ${subsetter}/bin/python3 - $src/charset-ranges.txt \
                    $src/jisx0208-kanji.txt $out/NotoSansJP-$weight.ttf <<'PY'
                import pathlib
                import sys

                from fontTools.ttLib import TTFont

                ranges_path, kanji_path, font_path = (pathlib.Path(a) for a in sys.argv[1:4])

                requested = set()
                for entry in ranges_path.read_text(encoding="utf-8").replace(",", " ").split():
                    if not entry:
                        continue
                    low, _, high = entry.partition("-")
                    lo = int(low.removeprefix("U+"), 16)
                    hi = int(high.removeprefix("U+"), 16) if high else lo
                    requested.update(range(lo, hi + 1))

                requested.update(ord(c) for c in kanji_path.read_text(encoding="utf-8") if not c.isspace())

                cmap = TTFont(font_path).getBestCmap()
                missing = sorted(c for c in requested if c not in cmap)
                if missing:
                    sys.exit(
                        f"{font_path.name}: {len(missing)} characters are not in the source font: "
                        + " ".join(f"U+{c:04X}" for c in missing[:40])
                    )
                print(f"{font_path.name}: {len(requested)} characters covered")
                PY
                done

                runHook postBuild
              '';

              installPhase = "true";
            };

          # vite-plus (vp) は nixpkgs 未収録・上流に flake が無いため自作。
          # nvfetcher 管理のプラットフォーム別 CLI バイナリ + pnpm で再現した
          # JS 依存ツリーを $out/libexec/vite-plus/<version> に配置する。
          # fetchPnpmDeps / pnpmConfigHook が inputs.nixpkgs に無いため、
          # gleam と同様に新しい inputs.nixpkgs-latest から pkgs を取る。
          vite-plus = import ./pkgs/vite-plus {
            pkgs = import inputs.nixpkgs-latest { inherit system; };
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
            # pnpm-lock.yaml / package-lock.json はパッケージマネージャが生成
            # するためフォーマットを当てると差分が出続け、pre-commitのtreefmtが
            # 常に失敗する (.wt/ はgitignore済みの別リポジトリ置き場)。
            # .tmp-* は検証用のスクラッチ (生成HTMLの山など) を置く場所。
            # 数千ファイルのHTMLが *.html にマッチし、`nix fmt` が実測57秒
            # かかっていた (除外後は120ファイル・約1秒)。treefmtはgitignoreを
            # 見ずに明示的なファイルリストをformatterへ渡すため、vp側の
            # ignore では防げない (明示指定された .tmp-* は整形される)。
            # パターンは「.tmp-* という名前のファイル/ディレクトリ」に当てる。
            # ディレクトリに当たれば配下ごと除外される。先頭 `**/` は0階層に
            # マッチしないため、直下用と併記する。lockfile も同じ理由で
            # 直下用 (`pnpm-lock.yaml`) と下位階層用 (`**/...`) を併記する
            # (vp はlockfileを自前で無視するが、treefmt側でも明示的に外す)。
            settings.excludes = [
              ".commandcode/**"
              ".wt/**"
              ".tmp-*"
              "**/.tmp-*"
              "pnpm-lock.yaml"
              "**/pnpm-lock.yaml"
              "package-lock.json"
              "**/package-lock.json"
            ];
            programs = {
              nixfmt.enable = true;
              rufo.enable = true;
            };
            # JS/TS/JSON/Markdown等は vite-plus 内蔵の Oxfmt で整形する。
            # deno fmt から切り替え (oxc 系フォーマッタに統一)。
            # `vp run fmt` (vp fmt) と同じ oxfmt なので整形結果が一致する。
            settings.formatter = {
              oxfmt = {
                command = "${vite-plus}/bin/vp";
                options = [ "fmt" ];
                includes = [
                  "*.js"
                  "*.jsx"
                  "*.mjs"
                  "*.cjs"
                  "*.ts"
                  "*.tsx"
                  "*.mts"
                  "*.cts"
                  "*.json"
                  "*.jsonc"
                  "*.json5"
                  "*.md"
                  "*.markdown"
                  "*.mdx"
                  "*.yaml"
                  "*.yml"
                  "*.toml"
                  "*.html"
                  "*.css"
                  "*.scss"
                  "*.less"
                  "*.vue"
                  "*.svelte"
                  "*.graphql"
                  "*.gql"
                ];
              };
            };
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
                vitest-test = {
                  enable = true;
                  name = "vitest-test";
                  entry = "${vitest-test}/bin/vitest-test";
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
                pnpm
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
                vite-plus
                adrs
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

                              [ -e ./og/static/fonts ] && rm -r ./og/static/fonts
                              mkdir -p ./og/static/fonts
                              ln -s ${ogFonts}/NotoSansJP-Regular.ttf ./og/static/fonts/NotoSansJP-Regular.ttf
                              ln -s ${ogFonts}/NotoSansJP-Bold.ttf ./og/static/fonts/NotoSansJP-Bold.ttf

                              ${pkgs.git-secrets}/bin/git-secrets --add '^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z0-9]{4}$'

                  if [ -L ".mcp.json" ]; then
                    unlink .mcp.json
                  fi
                  ln -sf ${mcp-config} .mcp.json
              '';
            };

          packages.og-fonts = ogFonts;
          packages.vite-plus = vite-plus;

          # Minimal shell for CI builds: only what `bun run build`, `vp install`
          # and `wrangler pages deploy` need, so CI doesn't pay for editor
          # tooling (LSPs, textlint, claude-code, agent-browser, ...).
          # nodejs はこの overlay 非適用の clean-pkgs から取る
          # (devShells.default と同じ理由。67行目周辺のコメント参照)。
          # vite-plus は flake 内の自作 derivation (packages.vite-plus) を
          # そのまま devShell に載せ、CI で vp を bootstrap する。
          devShells.ci =
            let
              clean-pkgs = import inputs.nixpkgs { inherit system; };
            in
            pkgs.mkShell {
              packages = with pkgs; [
                vips
                stdenv.cc.cc
                deno
                pnpm
                wrangler
                clean-pkgs.nodejs
                vite-plus
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
