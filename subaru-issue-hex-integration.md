# 標準ライブラリの読み込みをHex.pm方式に移行する

## 概要

現在の手動モジュール管理方式を廃止し、Hex.pmからパッケージ単位で読み込む新方式に移行する。

## 現状の問題点

現在の`addStandardLibrary()`では、各ライブラリのモジュールを個別にGitHubから取得している：

```typescript
{
  name: "gleam_stdlib",
  baseUrl: "https://raw.githubusercontent.com/gleam-lang/stdlib/main/src",
  modules: ["gleam/io", "gleam/list", "gleam/string", ...] // 手動で列挙
}
```

**問題点:**
- 新しいモジュールが追加されても自動で取得されない
- 依存モジュールの漏れが発生しやすい
- メンテナンスコストが高い
- バージョン管理ができない

## 提案する新方式

### 設定インターフェース

```typescript
interface PackageConfig {
  name: string;
  version?: string;
  include?: string[];  // 特定モジュールのみ読み込む
  exclude?: string[];  // 特定モジュールを除外
}

interface StandardLibraryConfig {
  preset?: "minimal" | "standard" | "full" | "none";
  packages?: (string | PackageConfig)[];
  cache?: {
    enabled: boolean;
    directory?: string;
    ttl?: number;
  };
}
```

### 設定例

**シンプルな指定:**
```json
{
  "standardLibraries": {
    "packages": ["gleam_stdlib", "gleam_json", "gleam_http"]
  }
}
```

**バージョン指定:**
```json
{
  "standardLibraries": {
    "packages": [
      { "name": "gleam_stdlib", "version": "0.68.1" },
      "gleam_json"
    ]
  }
}
```

**プリセット + 追加パッケージ:**
```json
{
  "standardLibraries": {
    "preset": "minimal",
    "packages": ["gleam_json"]
  }
}
```

### プリセット定義

| プリセット | 含まれるパッケージ |
|-----------|-------------------|
| `none` | なし |
| `minimal` | gleam_stdlib |
| `standard` | gleam_stdlib, gleam_javascript, gleam_json |
| `full` | 現在の8パッケージ全て（デフォルト） |

## 技術的な実装

### Hex APIの利用

```
パッケージ情報: https://hex.pm/api/packages/{name}
tarball取得:    https://repo.hex.pm/tarballs/{name}-{version}.tar
```

### tarball展開

Deno標準ライブラリのみで対応可能（外部依存なし）：

```typescript
import { UntarStream } from "@std/tar/untar-stream";

async function fetchAndExtract(name: string, version: string): Promise<Map<string, string>> {
  const modules = new Map<string, string>();

  const res = await fetch(`https://repo.hex.pm/tarballs/${name}-${version}.tar`);

  // Hex tarballは二重構造: package.tar > contents.tar.gz > src/
  for await (const entry of res.body!.pipeThrough(new UntarStream())) {
    if (entry.path === "contents.tar.gz" && entry.readable) {
      const innerStream = entry.readable
        .pipeThrough(new DecompressionStream("gzip"))
        .pipeThrough(new UntarStream());

      for await (const file of innerStream) {
        if (file.path.endsWith(".gleam") && file.readable) {
          const content = await new Response(file.readable).text();
          modules.set(file.path, content);
        }
      }
    }
  }

  return modules;
}
```

### キャッシュ統合

既存のWASMコンパイラキャッシュと同じディレクトリ構造で管理：

```
~/.cache/subaru/
├── wasm/                      # 既存: WASMコンパイラ
│   └── gleam-wasm-v1.11.0.wasm
└── packages/                  # 新規: Hexパッケージ
    ├── gleam_stdlib/
    │   └── 0.68.1/
    │       ├── .meta.json
    │       └── src/
    │           └── gleam/*.gleam
    └── gleam_json/
        └── 2.0.0/
            └── ...
```

**キャッシュ動作:**
| 状況 | 動作 |
|------|------|
| キャッシュHIT | ローカルから読込（高速） |
| キャッシュMISS | Hex→ストリーム展開→キャッシュ保存 |
| キャッシュ無効 | 常にHexから取得（保存しない） |
| TTL期限切れ | 再取得してキャッシュ更新 |

## 期待される効果

| 観点 | 効果 |
|------|------|
| **メンテナンス** | モジュール一覧の手動管理が不要に |
| **網羅性** | パッケージ内の全モジュールを自動取得 |
| **バージョン管理** | 特定バージョンの固定が可能 |
| **再現性** | バージョン固定でビルドの再現性を確保 |
| **拡張性** | Hexに公開されている全パッケージが利用可能 |
| **パフォーマンス** | キャッシュによる高速化 |
| **オフライン対応** | キャッシュがあればネットワーク不要 |

## タスク

- [ ] `HexClient`クラスの実装
  - [ ] パッケージ情報取得 (`getPackageInfo`)
  - [ ] 最新バージョン取得 (`getLatestVersion`)
  - [ ] tarball取得・展開 (`fetchAndExtract`)
- [ ] キャッシュ機能の実装
  - [ ] キャッシュ読み込み
  - [ ] キャッシュ保存
  - [ ] TTL管理
- [ ] `GleamRunner.addStandardLibrary()`の改修
  - [ ] 設定インターフェースの追加
  - [ ] プリセット対応
  - [ ] `include`/`exclude`フィルタ
- [ ] 従来のGitHub直接取得方式の削除
- [ ] ドキュメント更新
