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
    version = "1.0.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-darwin-arm64/-/vite-plus-cli-darwin-arm64-1.0.0.tgz";
      sha256 = "sha256-MasCokHtBO0TarNlnYFvKUnogAEWsFPH9FtxURP2dKs=";
    };
  };
  vite-plus-cli-darwin-x64 = {
    pname = "vite-plus-cli-darwin-x64";
    version = "1.0.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-darwin-x64/-/vite-plus-cli-darwin-x64-1.0.0.tgz";
      sha256 = "sha256-xmsaWDy/2juGRU69CCwUDfB6RvKumQvceu0n4SI3teo=";
    };
  };
  vite-plus-cli-linux-arm64-gnu = {
    pname = "vite-plus-cli-linux-arm64-gnu";
    version = "1.0.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-linux-arm64-gnu/-/vite-plus-cli-linux-arm64-gnu-1.0.0.tgz";
      sha256 = "sha256-l6LbkqiEgervbAUM52TkN4iyMMX9We7gSg+KEo/AMgs=";
    };
  };
  vite-plus-cli-linux-x64-gnu = {
    pname = "vite-plus-cli-linux-x64-gnu";
    version = "1.0.0";
    src = fetchurl {
      url = "https://registry.npmjs.org/@voidzero-dev/vite-plus-cli-linux-x64-gnu/-/vite-plus-cli-linux-x64-gnu-1.0.0.tgz";
      sha256 = "sha256-MUObEuuKhCB3uiDBpu6QFuG3VSWHt2cGsXb6vOWR+1I=";
    };
  };
}
