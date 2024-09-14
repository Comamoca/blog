{ pkgs, ... }:
{
  projectRootFile = "flake.nix";
  programs = {
    nixfmt.enable = true;
    deno.enable = true;
  };

  settings.formatter =
    {
    };
}
