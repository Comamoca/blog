/**
 * src/img・src/public・src/well-known をそのまま配信するViteプラグイン。
 *
 * 現行 _config.ts の `site.add("img")` / `site.copy("./public")` /
 * `site.copy("./well-known", ".well-known")` に相当する。ox-content の
 * publicDir は単一ディレクトリしか指せないため、dev はミドルウェアで直接
 * ストリーミングし、build は closeBundle で outDir へコピーする。
 */
import type { Plugin } from "vite";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";

const MOUNTS: Array<{ urlPrefix: string; dir: string; outSubdir: string }> = [
  { urlPrefix: "/img/", dir: "src/img", outSubdir: "img" },
  {
    urlPrefix: "/.well-known/",
    dir: "src/well-known",
    outSubdir: ".well-known",
  },
  // public/ はサイトルート直下に展開する (favicon.svg, icon.png)
  { urlPrefix: "/", dir: "src/public", outSubdir: "." },
];

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function staticAssets(): Plugin {
  return {
    name: "blog:static-assets",

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        for (const { urlPrefix, dir } of MOUNTS) {
          if (!url.startsWith(urlPrefix)) continue;
          const rel = url.slice(urlPrefix.length);
          // ディレクトリトラバーサル対策
          if (rel.includes("..")) continue;
          const filePath = path.join(dir, rel);
          try {
            const stat = await fsp.stat(filePath);
            if (!stat.isFile()) continue;
            const ext = path.extname(filePath);
            res.setHeader(
              "Content-Type",
              MIME[ext] ?? "application/octet-stream",
            );
            fs.createReadStream(filePath).pipe(res);
            return;
          } catch {
            // このマウントに該当ファイルが無ければ次のマウントを試す
          }
        }
        next();
      });
    },

    async closeBundle() {
      const outDir = "dist";
      for (const { dir, outSubdir } of MOUNTS) {
        try {
          await fsp.access(dir);
        } catch {
          continue;
        }
        await fsp.cp(dir, path.join(outDir, outSubdir), { recursive: true });
      }
    },
  };
}
