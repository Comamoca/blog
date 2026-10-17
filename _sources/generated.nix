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
    version = "1.3.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-darwin-arm64/-/vite-plus-cli-darwin-arm64-1.3.0.tgz";
      sha256 = "sha256-lgVFl5HUb08xavml5ITAvoDqG3aVefPbvfbbpS09a9g=";
    };
  };
  vite-plus-cli-darwin-x64 = {
    pname = "vite-plus-cli-darwin-x64";
    version = "1.3.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-darwin-x64/-/vite-plus-cli-darwin-x64-1.3.0.tgz";
      sha256 = "sha256-n2QwetP2byV8TmHQRixL6aVOj5Z57QVWtThmcgn+zSY=";
    };
  };
  vite-plus-cli-linux-arm64-gnu = {
    pname = "vite-plus-cli-linux-arm64-gnu";
    version = "1.3.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-linux-arm64-gnu/-/vite-plus-cli-linux-arm64-gnu-1.3.0.tgz";
      sha256 = "sha256-/oh2Z3UGA058GFiI4CJAAgiY/4X11qB5Bnhw6we1iTw=";
    };
  };
  vite-plus-cli-linux-x64-gnu = {
    pname = "vite-plus-cli-linux-x64-gnu";
    version = "1.3.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-linux-x64-gnu/-/vite-plus-cli-linux-x64-gnu-1.3.0.tgz";
      sha256 = "sha256-ebEUvMzz96CQ/Qz9/sb3W8nxLPXDKaoPF+dJRfxJRb0=";
    };
  };
}
