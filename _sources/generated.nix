# nvfetcher 管理ソースのうち pkgs/vite-plus が必要とする vite-plus-cli-* のみを
# 抜粋したサブセット (原本: dotfiles/_sources/generated.nix)。vp を更新する際は
# nvfetcher でバイナリの version/hash を再計算し、この4エントリを同期させること。
{
  fetchgit,
  fetchurl,
  fetchFromGitHub,
  dockerTools,
}:
{
  vite-plus-cli-darwin-arm64 = {
    pname = "vite-plus-cli-darwin-arm64";
    version = "1.4.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-darwin-arm64/-/vite-plus-cli-darwin-arm64-1.4.0.tgz";
      sha256 = "sha256-h8OmqE6TVswjuyHwbGUJ3/M892WTS/9mO6RAQCqO4rU=";
    };
  };
  vite-plus-cli-darwin-x64 = {
    pname = "vite-plus-cli-darwin-x64";
    version = "1.4.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-darwin-x64/-/vite-plus-cli-darwin-x64-1.4.0.tgz";
      sha256 = "sha256-oQtV2V16nzc/txFO6IuWkBkDGAEbIOxmVJIee9UmT+I=";
    };
  };
  vite-plus-cli-linux-arm64-gnu = {
    pname = "vite-plus-cli-linux-arm64-gnu";
    version = "1.4.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-linux-arm64-gnu/-/vite-plus-cli-linux-arm64-gnu-1.4.0.tgz";
      sha256 = "sha256-TvMYzR/vzu2hGE2MANkq3K7GaWhkmm9IVR2wFUzcQuA=";
    };
  };
  vite-plus-cli-linux-x64-gnu = {
    pname = "vite-plus-cli-linux-x64-gnu";
    version = "1.4.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-linux-x64-gnu/-/vite-plus-cli-linux-x64-gnu-1.4.0.tgz";
      sha256 = "sha256-9FsIgyVgaB5z1Bqd68+iM8TbjtMHEuAAxYYZQkKIwrg=";
    };
  };
}
