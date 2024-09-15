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
      in
      {
        formatter = treefmtEval.config.build.wrapper;
        # packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;
        # packages.x86_64-linux.default = self.packages.x86_64-linux.hello;

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            textlint
            textlint-rule-preset-ja-technical-writing

            ruby
            rubyPackages.thor

            nil
            lua-language-server
            efm-langserver
            nodePackages_latest.typescript-language-server

            just
          ];
        };
      }
    );
}
