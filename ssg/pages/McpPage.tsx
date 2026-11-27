export default function McpPage() {
  return (
    <>
      <p>
        comamoca.dev をプログラム的に読む・検索するエージェント・開発者向けのページです。
        人間向けの説明はこのページに、機械可読な仕様は各リンク先に置いています。
      </p>

      <h2>MCP (search_blog)</h2>
      <p>
        各ページに <a href="https://github.com/webmachinelearning/webmcp">WebMCP</a> のツールとして{" "}
        <code>search_blog</code> を登録しています。
        <code>navigator.modelContext.registerTool</code> に対応したブラウザ内エージェントから、
        サイト内検索 (Pagefindのインデックス) を直接呼び出せます。
      </p>
      <ul>
        <li>
          <code>name</code>: <code>search_blog</code>
        </li>
        <li>
          <code>input</code>: <code>{"{ query: string }"}</code>
        </li>
        <li>
          <code>output</code>: 一致した記事の <code>url</code>・<code>title</code>・
          <code>excerpt</code> の配列 (JSON文字列)
        </li>
      </ul>

      <h2>API</h2>
      <p>
        記事投稿・更新用のAPIは無く、以下の読み取り専用エンドポイントのみです。仕様は{" "}
        <a href="/openapi.json">OpenAPI 3.1 (/openapi.json)</a> にまとめています。
      </p>
      <ul>
        <li>
          <a href="/api/feed.xml">/api/feed.xml</a> — RSS 2.0フィード
        </li>
        <li>
          <a href="/api/feed.json">/api/feed.json</a> — JSON Feed 1.1
        </li>
        <li>
          <a href="/sitemap.xml">/sitemap.xml</a> — URL一覧 (XML)
        </li>
        <li>
          <a href="/sitemap.md">/sitemap.md</a> — 記事タイトル・説明付きの全ページ一覧 (Markdown)
        </li>
      </ul>
      <p>
        存在しないパスは404を返しますが、<code>Accept: text/markdown</code> なら
        Markdownのエラー本文、<code>Accept: application/json</code> または <code>/api/*</code>{" "}
        配下ならJSON (<code>error.code</code>/<code>error.message</code>/
        <code>error.resolution</code>) のエラー本文になります。
      </p>

      <h2>Machine-readable docs</h2>
      <ul>
        <li>
          <a href="/llms.txt">/llms.txt</a> ・<a href="/llms-full.txt">/llms-full.txt</a> —
          サイト概要とナビゲーション
        </li>
        <li>
          <a href="/agents.md">/agents.md</a> — このサイトを読むAIエージェント向けの閲覧ガイド
        </li>
        <li>
          <a href="/.well-known/api-catalog">/.well-known/api-catalog</a> — RFC 9727 Linkset
        </li>
        <li>
          <a href="/.well-known/ard.json">/.well-known/ard.json</a> — Agentic Resource Discovery
          カタログ
        </li>
        <li>
          <a href="/skills/comamoca-blog/SKILL.md">Agent Skill (comamoca-blog)</a> —
          記事一覧取得・検索の手順
        </li>
      </ul>

      <h2>Source</h2>
      <p>
        このサイト自体のソースコードは{" "}
        <a href="https://github.com/Comamoca/blog">github.com/Comamoca/blog</a> で公開しています (
        <a href="https://github.com/Comamoca">@Comamoca</a>)。
      </p>
    </>
  );
}
