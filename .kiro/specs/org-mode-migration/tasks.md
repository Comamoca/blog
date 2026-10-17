# 実装計画

-
  1. [ ] 回帰検証の土台づくり (最初に行う)
- [ ] 1.1 現行 main のベースライン確認
  - worktree (`feat/org-mode-migration`) で `deno task test` を実行し、
    `tests/url_compat_test.ts` / `tests/feed_compat_test.ts` が green
    であることを 確認する
  - `npm run build` で現行 dist を生成し、ビルドが通ることを確認する
  - _Requirements: 4.3, 7.1_

- [ ] 1.2 md 記事 HTML のスナップショット取得
  - 現行 dist の全記事 HTML のハッシュを取得し、Phase 1 で `.md` 記事が
    変化しないことの比較基準とする
  - _Requirements: 8.1_

- [ ] 1.3 影響規模の把握
  - `grep -l '\[\^' src/blog/*.md | wc -l` で脚注を含む記事数を数える
  - 生HTML (`<` を含む) 記事数、テーブルを含む記事数を把握する
  - _Requirements: 1.3, 1.4, 1.5_

-
  2. [ ] Phase 0: org 出力の Spike (正規化方針の確定)
- [ ] 2.1 uniorg パイプラインの試作
  - `unified().use(uniorgParse).use(uniorgRehype)` を一時スクリプトで動かし、
    org の代表サンプルを HTML 化する
  - `uniorg-rehype` の出力 HTML を観察する
  - _Requirements: 1.1_

- [ ] 2.2 脚注 markup の差分確定
  - uniorg-rehype の脚注出力を、既存 `footnotePost` と CSS が期待する remark-gfm
    構造 (`#footnote-label` / `data-footnote-backref`) と比較する
  - 正規化 plugin で吸収可能かを判定する (不可能なら案Cを再評価)
  - _Requirements: 1.3_

- [ ] 2.3 src ブロック / inline code / export html の検証
  - `#+begin_src <lang>` が `class="language-<lang>"` を出力するか確認する
    (Shiki 適用の前提)
  - `~code~` `=code=` が `<code>` になるか確認する
  - `#+begin_export html` / `@@html:...@@` が素通しされるか確認する
  - _Requirements: 1.2, 1.5, 1.6_

- [ ] 2.4 キーワード抽出の検証
  - `#+TITLE:` `#+DESCRIPTION:` `#+DATE: [..]` `#+FILETAGS:` `#+EMOJI:`
    `#+DRAFT:` を行ベースで抽出できるか確認する
  - `#+DATE:` を `MMM d yyyy` へ正規化する方針を確定する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

-
  3. [ ] Phase 1: org パイプライン追加 (md は無傷)
- [ ] 3.1 Shiki highlighter の共有化
  - `ssg/markdown.ts` から highlighter 生成と `shiki()` ラッパーを
    `ssg/highlight.ts` へ切り出す
  - md パイプラインは共有モジュールを import するよう変更する (挙動不変)
  - _Requirements: 1.2, 2.4_

- [ ] 3.2 `ssg/org-meta.ts` の実装
  - 行ベースの `#+KEYWORD:` 抽出と `#+DATE:` 正規化を実装する
  - `#+FILETAGS: :a:b:` を `string[]` へ、`#+DRAFT:` を真偽へ変換する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.3 `ssg/org.ts` の実装
  - `renderOrg(source, file)` を unified (uniorgParse → uniorgRehype → shiki →
    linkcardRehype → footnoteNormalize) で実装する
  - `transformMarkdown` は通さない
  - _Requirements: 1.1, 1.2_

- [ ] 3.4 `ssg/linkcard-rehype.ts` の実装
  - `ssg/linkcard.ts` の `cardLinkElement()` を export し、HAST の
    `p > 単一text` をカード HTML へ置換する
  - `fetchOGInfo` のファイルキャッシュを共有し、`DISABLE_LINKCARD` を尊重する
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.5 脚注正規化 plugin の実装
  - Phase 0 の結論に基づき、uniorg の脚注構造を gfm 相当へ正規化する
  - 既存 `footnotePost` を md/org 双方へ適用する
  - _Requirements: 1.3_

- [ ] 3.6 `host.ts` の拡張子分岐
  - `loadPosts()` で `.md` と `.org` を列挙し、拡張子ごとにメタデータ抽出を
    分岐する (stem は両拡張子を除去)
  - `render()` で `.org` なら `renderOrg`、それ以外は `renderMarkdown`
    に分岐する
  - feed 日付を `commitTimes.get(...md) ?? commitTimes.get(...org)` に変更する
  - _Requirements: 4.2, 4.5, 8.2_

- [ ] 3.7 ルート依存関係の確認
  - 記事ルートの `dependencies` が `.org` でも正しく宣言されることを確認する
  - _Requirements: 7.3_

- [ ] 3.8 dev サーバーでの反映確認
  - 手書きの `.org` 記事を追加し、編集→プレビュー反映を実機で確認する
  - _Requirements: 7.3, 8.2_

- [ ] 3.9 org golden test の追加
  - 脚注・`#+begin_src`・裸URL・テーブル・export html を含む fixture の 生成
    HTML を断言するテストを追加する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 7.2_

- [ ] 3.10 `tests/diary.test.ts` の拡張
  - `.md` と `.org` の双方を対象に、ファイル名日付と `#+DATE:` の一致を検証する
  - _Requirements: 3.2, 7.2_

- [ ] 3.11 Phase 1 の回帰確認
  - 1.2 の md 記事先スナップショットとビルド後 dist を比較し、`.md` 記事の
    描画が変化していないことを確認する
  - _Requirements: 8.1_

-
  4. [ ] Phase 2: 変換器 + パイロット
- [ ] 4.1 `scripts/md2org.ts` の実装
  - YAML frontmatter を org キーワードへ変換する
  - 本文を pandoc (`nix shell nixpkgs#pandoc` の `-f gfm -t org`) で変換する
  - 生HTML を `#+begin_export html` / `@@html:...@@` へ対応付ける
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.2 代表記事の変換 (パイロット)
  - 脚注・表・生HTML・linkcard 密集・日報を含む 5-10 記事を変換する
  - 1 ファイル 1 コミットで `.md` 削除 + `.org` 追加する
  - _Requirements: 4.5_

- [ ] 4.3 パイロットの検証
  - 対象記事の dist HTML 差分と、RSS の pubDate/title/link の一致を検証する
  - _Requirements: 4.3, 4.4_

-
  5. [ ] Phase 3: 一括変換
- [ ] 5.1 年度単位のバッチ変換
  - 残りの記事を年度単位で変換し、各バッチで build + url_compat を実行する
  - 各バッチで dist HTML 差分 (脚注部以外) と RSS diff を確認する
  - _Requirements: 4.1, 4.3_

- [ ] 5.2 `src/blog` から `.md` を排除
  - 全記事が `.org` になったことを確認する
  - _Requirements: 4.1, 8.2_

-
  6. [ ] Phase 4: カットオーバー (blog)
- [ ] 6.1 `pre-md-removal` タグの作成
  - md パイプラインが無傷で残る最後のコミットにタグを打つ (復元点)
  - _Requirements: 8.3_

- [ ] 6.2 `create.rb` の org 化
  - `diary_template` / `article_template` を org キーワード + org
    見出しへ変更する
  - 出力パスを `.org` へ変更する
  - _Requirements: 5.1, 5.2_

- [ ] 6.3 `justfile` の org 化
  - `just open` / `edit-diary` / `latest-diary` の `.md` を `.org` へ変更する
  - `just new` / `just diary` が org 雛形を生成することを確認する
  - _Requirements: 5.3_

- [ ] 6.4 md パイプラインの削除
  - `renderMarkdown` / `MD_OPTIONS` / mdast linkcard / `prepareSource` 依存 / md
    golden test 分岐を削除する (`footnotePost` は org と共用のため残す)
  - `vite.config.ts` / `host.ts` から md 前提を除去する
  - _Requirements: 8.3_

- [ ] 6.5 ドキュメント更新
  - `AGENTS.md` / `.kiro/steering/tech.md` / `structure.md` を org
    構成へ更新する
  - `.kiro/specs/org-mode-migration/spec.json` の phase を更新する
  - _Requirements: 8.3_

- [ ] 6.6 最終回帰確認
  - `deno task test` (url_compat / feed_compat) と `npm run build` を通す
  - _Requirements: 4.1, 4.3, 7.1_

-
  7. [ ] Emacs (dotfiles) の org 統合
- [ ] 7.1 タグ補完の org 対応 (両対応 → 最終的に org のみ)
  - `my/blog-tags-*` (init.el:2630-2781) の YAML parse を org キーワード parse
    へ 変更し、走査対象を `.org` へ変更する
  - CAPF 登録 (`my/blog-markdown-capf-setup`, init.el:1709-1717) に
    `org-mode-hook` を追加する
  - _Requirements: 6.1_

- [ ] 7.2 記事/日報生成関数の org 化
  - `date-to-tempalte` / `create-diary-path` / `new-blog-article` /
    `latest-diary` / `create-diary-from-calendar` を `.org` + org キーワード
    出力へ変更する
  - _Requirements: 6.2_

- [ ] 7.3 `consult-*` の org 対応
  - `consult-diary` / `consult-article` の `-diary.md$` を `.org` へ変更する
  - _Requirements: 6.3_

- [ ] 7.4 画像貼付の org リンク化
  - `blog-paste-image` (init.el:3086-3093) の `![](/img/x.png)` を
    `[[/img/x.png]]` へ変更する
  - _Requirements: 6.4_

- [ ] 7.5 tempel テンプレートの org 化
  - `emacs.d/templates` の `diary`/`article` を `markdown-mode` から `org-mode`
    スコープへ移し、org 構文へ変更する
  - _Requirements: 6.5_
