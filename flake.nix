{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    # crate2nix ={};

    outputs =
      {
        self,
        nixpkgs,
        flake-utils,
        ...
      }:
      flake-utils.lib.eachDefaultSystem (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          stdenv = pkgs.stdenv;
          treefmtEval = treefmt-nix.lib.evalModule pkgs ./treefmt.nix;
        in {
  formatter.x86_64-linux = treefmtEval.config.build.wrapper;
          # packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;
          # packages.x86_64-linux.default = self.packages.x86_64-linux.hello;

          devShells.x86_64-linux.default = pkgs.mkShell {
        packages = with pkgs; [
          nil
        ];
      };

          apps = {
            dev = {
              type = "app";
              program = "${pkgs.bun}";
            };
          };
        }
      );
  };
}
