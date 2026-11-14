/**
 * WebMCP: ブラウザ内のエージェントにサイト内検索をツールとして公開する。
 * navigator.modelContext が無い環境では何もしない。検索はPagefind (本番ビルドのみ生成)。
 */
export const WEBMCP_SCRIPT = `
(function () {
  var mc = (navigator && navigator.modelContext) || (document && document.modelContext);
  if (!mc || typeof mc.registerTool !== 'function') return;
  var pagefind;
  mc.registerTool({
    name: 'search_blog',
    description: 'comamoca.dev の記事を全文検索し、一致した記事のURL・タイトル・抜粋を返す。',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: '検索語' } },
      required: ['query']
    },
    execute: async function (args) {
      pagefind = pagefind || await import('/pagefind/pagefind.js');
      var search = await pagefind.search(args.query);
      var results = await Promise.all(search.results.slice(0, 10).map(function (r) { return r.data(); }));
      var items = results.map(function (d) { return { url: d.url, title: d.meta && d.meta.title, excerpt: d.excerpt }; });
      return { content: [{ type: 'text', text: JSON.stringify(items) }] };
    }
  });
})();
`;
