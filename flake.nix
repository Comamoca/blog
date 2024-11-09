{
  description = "A basic flake to with flake-parts";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
  };

  outputs =
    inputs@{
      self,
      systems,
      nixpkgs,
      treefmt-nix,
      flake-parts,
      git-hooks-nix,
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
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
          stdenv = pkgs.stdenv;

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

	  devShell = pkgs.mkShell {
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
              tailwindcss-language-server

              just
              nushell
              git-secrets
            ];

            shellHook = ''
              unlink .textlintrc
              ln -s ${textlintrc} .textlintrc
            '';
          };
        in
        {
          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
              deno.enable = true;
              rufo.enable = true;
            };

            settings.formatter = { };
          };

	  pre-commit = {
	    check.enable = true;
	    devShell = devShell;
	    settings = {
	      repos = [
	        {
	          repo = "local";
		  hooks = {
		    id = "git-secrets";
		    name = "git secrets";
                    entry = "git secrets --scan";
                    language = "system";
                    types = ["text"];
		  };
	        }
	      ];
	      hooks = {
	        nixfmt.enable = true;
	      };
	    };
	  };

          # When execute `nix develop`, you go in shell installed nil.
          devShells.default = devShell;
        };
    };
}
