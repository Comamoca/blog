{
  description = "A basic flake to with flake-parts";

  inputs = {
    # nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    nixpkgs.url = "github:NixOS/nixpkgs/master";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
    # deno-overlay.url = "github:haruki7049/deno-overlay";
  };

  outputs =
    inputs@{
      self,
      systems,
      nixpkgs,
      treefmt-nix,
      flake-parts,
      git-hooks-nix,
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
          system,
          ...
        }:
        let
          stdenv = pkgs.stdenv;

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

              cp NotoSansCJKjp-Bold.otf $out/bin
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

          git-secrets' = pkgs.writeShellApplication {
            name = "git-secrets";
            runtimeInputs = [ pkgs.git-secrets ];
            text = ''
              git secrets --scan
            '';
          };

          deno-test = pkgs.writeShellApplication {
            name = "deno-test";
            runtimeInputs = [ pkgs.deno ];
            text = ''
              ${pkgs.deno}/bin/deno test --allow-read --no-prompt
            '';
          };
        in
        {
          # _module.args.pkgs = import inputs.nixpkgs {
          #   inherit system;
          #   overlays = [
          #     inputs.deno-overlay.overlays.deno-overlay
          #   ];
          #   config = { };
          # };

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
              deno = {
                enable = true;
              };
              rufo.enable = true;
            };
            settings.formatter = { };
          };

          pre-commit = {
            check.enable = true;
            settings = {
              hooks = {
                treefmt.enable = true;
                ripsecrets.enable = true;
                git-secrets = {
                  enable = true;
                  name = "git-secrets";
                  entry = "${git-secrets'}/bin/git-secrets";
                  language = "system";
                  types = [ "text" ];
                };
                deno-test = {
                  enable = true;
                  name = "deno-test";
                  entry = "${deno-test}/bin/deno-test";
                  language = "system";
                  types = [ "text" ];
                };
              };
            };
          };

          # When execute `nix develop`, you go in shell installed nil.
          devShells.default = pkgs.mkShell {
            inputsFrom = [ config.pre-commit.devShell ];
            packages = with pkgs; [
              # (textlint.withPackages [
              #   textlint-rule-preset-ja-technical-writing
              #   textlint-rule-prh
              # ])

              vips
              stdenv.cc.cc

              # deno."1.28.0"
              # deno."2.2.5"
              deno
              bun
              wrangler

              # ruby
              ruby_3_4
              rubyPackages_3_4.thor

              nil
              lua-language-server
              efm-langserver
              # nodePackages_latest.typescript-language-server
              # ruby-lsp
              tailwindcss-language-server

              just
              nushell
              git-secrets
              unar

              # deploy
              wrangler
            ];

            # LD_LIBRARY_PATH = "${libPath}/lib";
            # LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";

            LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc ]}";

            shellHook = ''
              	      [ -e ./fonts ] && rm -r ./fonts
                            mkdir -p ./fonts/noto-fonts

                            [ -f .textlintrc ] && rm .textlintrc
                            ln -s ${textlintrc} .textlintrc

                            ln -s ${fonts}/bin/NotoSansCJKjp-Bold.otf ./fonts/noto-fonts/NotoSansCJKjp-Bold.otf
                            ln -s ${fonts}/bin/NotoSansCJKjp-Bold.otf ./fonts/noto-fonts/NotoSansCJKjp-Black.otf
                            ln -s ${fonts}/bin/NotoSansCJKjp-Bold.otf ./fonts/noto-fonts/NotoSansCJKjp-Regular.otf


                            ${pkgs.git-secrets}/bin/git-secrets --add '^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z0-9]{4}$'
            '';
          };
        };
    };
}
