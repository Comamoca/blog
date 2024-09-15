{ pkgs, ... }:
{
  projectRootFile = "flake.nix";
  programs = {
    nixfmt.enable = true;
    deno.enable = true;
    rufo.enable = true;
  };

  settings.formatter =
    {
    };
}
