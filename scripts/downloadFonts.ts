import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
import { join } from "jsr:@std/path";
import $ from "https://deno.land/x/dax@0.39.2/mod.ts";
import Kia from "https://deno.land/x/kia@0.4.1/mod.ts";

const FONT_URL =
  "https://github.com/notofonts/noto-cjk/releases/download/Sans2.004/06_NotoSansCJKjp.zip";
const NOTO_SANS_BOLD =
  "https://raw.githubusercontent.com/notofonts/noto-cjk/refs/heads/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf";

const outDir = "./fonts";
const zipPath = "noto-fonts.zip";

const dlSpinner = new Kia("Downloading fonts...");
const unarSpinner = new Kia("Decompressing...");

dlSpinner.start();
await download(FONT_URL, {
  dir: outDir,
  file: zipPath,
});
dlSpinner.succeed();

unarSpinner.start();
await $`unar -f -output-directory ${outDir} ${join(outDir, zipPath)}`.text();
unarSpinner.succeed();
