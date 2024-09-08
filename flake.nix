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
        in {
          formatter = pkgs.nixfmt-rfc-style;
          # packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;
          # packages.x86_64-linux.default = self.packages.x86_64-linux.hello;

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
