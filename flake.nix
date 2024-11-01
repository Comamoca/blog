{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };
  # crate2nix ={};

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      treefmt-nix,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        stdenv = pkgs.stdenv;
        treefmtEval = treefmt-nix.lib.evalModule pkgs ./treefmt.nix;

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
      in
      {
        formatter = treefmtEval.config.build.wrapper;
        # packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;
        # packages.x86_64-linux.default = self.packages.x86_64-linux.hello;

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            (textlint.withPackages [
              textlint-rule-preset-ja-technical-writing
              textlint-rule-prh
            ])

            ruby
            rubyPackages.thor

            nil
            lua-language-server
            efm-langserver
            nodePackages_latest.typescript-language-server
            ruby-lsp

            just
            nushell
          ];

          shellHook = ''
              unlink .textlintrc
              ln -s ${textlintrc} .textlintrc
          '';
        };
      }
    );
}
