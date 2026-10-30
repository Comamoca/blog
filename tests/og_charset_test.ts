import { test } from "vite-plus/test";
import { assert, assertEquals } from "./_asserts.ts";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * OGカードのフォント (flake.nix の ogFonts) が、カードに載りうる文字を
 * 覆っていることの検証。
 *
 * ogFonts は記事をコーパスにせず、`og/data/charset-ranges.txt` の
 * Unicodeレンジ + `og/data/jisx0208-kanji.txt` (JIS X 0208 の第1・第2水準漢字)
 * だけでサブセットする。記事をコーパスにすると、記事の title/description を
 * 更新するたびにフォントの中身 (= ストアパス) が変わり、OG Worker の
 * 再ビルド・再デプロイが必要になるため。
 *
 * その代わり、このテストが「記事やカードの固定文字列が固定集合の外に
 * 出ていないか」を監視する。集合外の文字は豆腐 (□) として描画されるので、
 * ここで落として気づかせる。
 *
 * 対処は2通り:
 *   1. `og/data/charset-ranges.txt` にレンジ (または U+XXXX) を追記する
 *      (追記すると ogFonts が変わるので OG CI が走り、Workerが再デプロイされる)
 *   2. タイトル/説明からその文字を外す
 */

const CHARSET_RANGES_PATH = join("og", "data", "charset-ranges.txt");
const JIS_X_0208_PATH = join("og", "data", "jisx0208-kanji.txt");
const OG_DIR = "og";
const BLOG_DIR = join("src", "blog");

type Range = { from: number; to: number };

type Source = { label: string; text: string };

/** `U+3040-309F,U+3000-303F` 形式をパースする (pyftsubset の --unicodes と同じ書式) */
function parseRanges(text: string, label: string): Range[] {
  const entries = text
    .trim()
    .split(/[,\s]+/)
    .filter((entry) => entry.length > 0);
  return entries.map((entry) => {
    const m = /^U\+([0-9A-Fa-f]{1,6})(?:-U?\+?([0-9A-Fa-f]{1,6}))?$/.exec(entry);
    if (m === null) {
      throw new Error(`${label} の書式が不正: ${JSON.stringify(entry)} (例: U+3040-309F)`);
    }
    const from = Number.parseInt(m[1], 16);
    const to = m[2] === undefined ? from : Number.parseInt(m[2], 16);
    if (to < from) {
      throw new Error(`${label} の範囲が逆転している: ${entry}`);
    }
    return { from, to };
  });
}

function isInRanges(codePoint: number, ranges: Range[]): boolean {
  return ranges.some(({ from, to }) => codePoint >= from && codePoint <= to);
}

function toCodePointLabel(char: string): string {
  const hex = char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0");
  return `U+${hex}`;
}

/** 記事の #+TITLE: / #+DESCRIPTION: はカードの title / description に載る */
function extractOgKeywords(org: string): string[] {
  const values: string[] = [];
  for (const line of org.split("\n")) {
    const m = /^#\+(TITLE|DESCRIPTION):[ \t]*(.*)$/i.exec(line.trim());
    if (m !== null) {
      values.push(m[2]);
    }
  }
  return values;
}

/**
 * host.ts が `buildOgImageUrl(layout, title, description)` に渡している
 * 文字列リテラルと参照している定数名を集める。
 *
 * ファイル全体を見ると、カードに載らない絵文字 (ページの `emoji:` など) まで
 * 拾って誤検出するため、OGカードの入力になる箇所だけを対象にする。
 * 記事の title (`p.title`) はここでは拾わない (記事側は #+TITLE: を見る)。
 */
function extractHostOgStrings(host: string): { literals: string[]; identifiers: string[] } {
  const literals: string[] = [];
  const identifiers = new Set<string>();
  for (const call of host.matchAll(/buildOgImageUrl\(([^)]*)\)/g)) {
    const args = call[1];
    for (const literal of args.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      // 第1引数の layout ("post" / "main") はカードに描画されない
      if (literal[1] !== "post" && literal[1] !== "main") {
        literals.push(literal[1]);
      }
    }
    for (const identifier of args.matchAll(/\b[A-Z][A-Z0-9_]*\b/g)) {
      identifiers.add(identifier[0]);
    }
  }
  return { literals, identifiers: [...identifiers] };
}

/** consts.ts の `export const NAME = "...";` を名前で引けるようにする */
function extractStringConstants(consts: string): Map<string, string> {
  const constants = new Map<string, string>();
  for (const m of consts.matchAll(/export const ([A-Z][A-Z0-9_]*)\s*=\s*"((?:[^"\\]|\\.)*)"/g)) {
    constants.set(m[1], m[2]);
  }
  return constants;
}

async function collectSources(): Promise<Source[]> {
  const sources: Source[] = [];

  for (const file of (await readdir(BLOG_DIR)).sort()) {
    if (!file.endsWith(".org")) continue;
    const text = await readFile(join(BLOG_DIR, file), "utf8");
    for (const value of extractOgKeywords(text)) {
      if (value.length > 0) {
        sources.push({ label: join(BLOG_DIR, file), text: value });
      }
    }
  }

  // カードの title/description/site_title は og_worker/card.gleam が持ち、
  // 記事以外でカードの文字を作るのは host.ts の buildOgImageUrl 呼び出しだけ。
  sources.push({
    label: join("og", "src", "og_worker", "card.gleam"),
    text: await readFile(join("og", "src", "og_worker", "card.gleam"), "utf8"),
  });

  const hostPath = join("host.ts");
  const constsPath = join("src", "consts.ts");
  const { literals, identifiers } = extractHostOgStrings(await readFile(hostPath, "utf8"));
  for (const literal of literals) {
    sources.push({ label: hostPath, text: literal });
  }

  const constants = extractStringConstants(await readFile(constsPath, "utf8"));
  for (const identifier of identifiers) {
    const value = constants.get(identifier);
    // SITE_URL など、カードに載らない定数は無視してよい
    if (value !== undefined) {
      sources.push({ label: `${constsPath}:${identifier}`, text: value });
    }
  }

  return sources;
}

/**
 * Gleam の行コメント (`//`) を取り除く。
 *
 * 文字列リテラル内の `//` (URL など) は消さない。
 */
function stripGleamComments(code: string): string {
  let out = "";
  let inString = false;
  for (let i = 0; i < code.length; i += 1) {
    const char = code[i];
    if (inString) {
      if (char === "\\") {
        out += char + (code[i + 1] ?? "");
        i += 1;
        continue;
      }
      if (char === '"') inString = false;
      out += char;
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    out += char;
  }
  return out;
}

/**
 * og/ 配下の Gleam ソースとテストが持つ文字列リテラル。
 *
 * ogFonts はもう og/ のソースをコーパスにしていないので、カードの固定文字列
 * (site_title) やテストの固定入力に新しい文字を足してもフォントは追随しない。
 * ここで拾って、集合外の文字があればテストで落とす。
 * コメントは対象外 (日本語コメントの珍しい漢字で落ちないようにするため)。
 */
async function collectGleamStringLiterals(): Promise<Source[]> {
  const sources: Source[] = [];

  const walk = async (dir: string): Promise<string[]> => {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        // 生成物 (gleam build) は対象外
        if (entry.name === "build" || entry.name === "node_modules") continue;
        files.push(...(await walk(path)));
        continue;
      }
      if (entry.name.endsWith(".gleam")) files.push(path);
    }
    return files.sort();
  };

  for (const dir of [join(OG_DIR, "src"), join(OG_DIR, "test")]) {
    for (const path of await walk(dir)) {
      const code = stripGleamComments(await readFile(path, "utf8"));
      for (const literal of code.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
        if (literal[1].length > 0) {
          sources.push({ label: path, text: literal[1] });
        }
      }
    }
  }

  return sources;
}

async function loadCoverage(): Promise<(char: string) => boolean> {
  const ranges = parseRanges(await readFile(CHARSET_RANGES_PATH, "utf8"), CHARSET_RANGES_PATH);
  assert(ranges.length > 0, `${CHARSET_RANGES_PATH} が空`);

  const kanji = await readFile(JIS_X_0208_PATH, "utf8");
  const kanjiChars = new Set([...kanji].filter((char) => !/\s/.test(char)));
  assert(kanjiChars.size > 6000, `JIS X 0208 の漢字一覧が想定より少ない: ${kanjiChars.size}`);

  return (char: string) => {
    if (/\s/.test(char)) return true;
    if (kanjiChars.has(char)) return true;
    return isInRanges(char.codePointAt(0)!, ranges);
  };
}

test("OGフォントの固定文字集合が、カードに載りうる文字をすべて覆う", async () => {
  const isCovered = await loadCoverage();
  const sources = await collectSources();
  assert(sources.length > 0, "検査対象の文字列が1つも集まらなかった");

  const missing = new Map<string, Set<string>>();
  for (const { label, text } of sources) {
    for (const char of text) {
      if (isCovered(char)) continue;
      const chars = missing.get(char) ?? new Set<string>();
      chars.add(label);
      missing.set(char, chars);
    }
  }

  const detail = [...missing.entries()]
    .sort(([a], [b]) => a.codePointAt(0)! - b.codePointAt(0)!)
    .map(
      ([char, labels]) =>
        `  ${toCodePointLabel(char)} ${JSON.stringify(char)}: ${[...labels].join(", ")}`,
    )
    .join("\n");

  assertEquals(
    missing.size,
    0,
    `OGカードのフォントに入らない文字が ${missing.size} 種類あります。豆腐 (□) になります。\n` +
      `${detail}\n` +
      `対処: ${CHARSET_RANGES_PATH} にその文字のレンジ (または U+XXXX) を追記してください。\n` +
      `追記すると ogFonts が変わるため、OG Worker が再ビルド・再デプロイされます。`,
  );
});

test("OG Workerのソース/テストの文字列リテラルもフォントの文字集合に収まる", async () => {
  const isCovered = await loadCoverage();
  const sources = await collectGleamStringLiterals();
  assert(sources.length > 0, "og/ から文字列リテラルが1つも集まらなかった");

  const missing = new Map<string, Set<string>>();
  for (const { label, text } of sources) {
    for (const char of text) {
      if (isCovered(char)) continue;
      const chars = missing.get(char) ?? new Set<string>();
      chars.add(label);
      missing.set(char, chars);
    }
  }

  const detail = [...missing.entries()]
    .sort(([a], [b]) => a.codePointAt(0)! - b.codePointAt(0)!)
    .map(
      ([char, labels]) =>
        `  ${toCodePointLabel(char)} ${JSON.stringify(char)}: ${[...labels].join(", ")}`,
    )
    .join("\n");

  assertEquals(
    missing.size,
    0,
    `OG Workerのソース/テストがフォントに入らない文字を含んでいます (${missing.size} 種類)。\n` +
      `${detail}\n` +
      `対処: ${CHARSET_RANGES_PATH} にその文字のレンジ (または U+XXXX) を追記してください。`,
  );
});

test("charset-ranges.txt は pyftsubset が解釈できる書式で、記事非依存の固定集合になっている", async () => {
  const text = await readFile(CHARSET_RANGES_PATH, "utf8");
  const ranges = parseRanges(text, CHARSET_RANGES_PATH);

  // 日本語のカードが成立する最低線。範囲は「Unicode で割り当て済みの文字」に
  // 限る。U+3040 / U+3097 / U+3098 のような未割り当てコードポイントまで要求すると、
  // 存在しない文字を取りに行くだけのレンジがデータに混ざる。
  const minimum: [number, number, string][] = [
    [0x3041, 0x3096, "ひらがな"],
    [0x3099, 0x309f, "濁点・半濁点と繰り返し記号"],
    [0x30a0, 0x30ff, "カタカナ"],
    [0x3000, 0x303f, "CJKの約物"],
    [0xff01, 0xff5e, "全角形 (ASCII相当)"],
    // U+FFE7 / U+FFEF は未割り当てなので分けて書く
    [0xffe0, 0xffe6, "全角の記号"],
    [0xffe8, 0xffee, "全角の記号"],
  ];

  const missing: string[] = [];
  for (const [from, to, label] of minimum) {
    for (let codePoint = from; codePoint <= to; codePoint += 1) {
      if (!isInRanges(codePoint, ranges)) {
        missing.push(`  U+${codePoint.toString(16).toUpperCase().padStart(4, "0")} ${label}`);
      }
    }
  }

  assertEquals(
    missing.length,
    0,
    `charset-ranges.txt に日本語カードの最低線が欠けています (${missing.length} 文字)。\n` +
      `${missing.join("\n")}\n` +
      `対処: ${CHARSET_RANGES_PATH} に該当するレンジを追記してください。`,
  );
});

/**
 * `jisx0208-kanji.txt` は「JIS X 0208 の漢字 (第1・第2水準 = 区16-84) を
 * コードポイント順に並べたもの」として固定する。
 *
 * この一覧が「どの漢字をフォントに入れるか」の唯一の定義なので、手で書き換えて
 * 文字が欠けたり別の文字が混ざったりしていないことを、EUC-JP から引き直した
 * 集合と突き合わせて確かめる。区1の記号 (仝 = 同の字点) は漢字ではないため
 * ここには含めない。
 */
test("jisx0208-kanji.txt は JIS X 0208 の漢字 (区16-84) と一致する", async () => {
  const raw = await readFile(JIS_X_0208_PATH, "utf8");
  const actual = [...raw].filter((char) => !/\s/.test(char));

  let decoder: TextDecoder;
  try {
    decoder = new TextDecoder("euc-jp");
  } catch (error) {
    throw new Error(
      `EUC-JP デコーダが使えないため ${JIS_X_0208_PATH} を検証できません ` +
        `(Node を full-icu でビルドしてください): ${String(error)}`,
    );
  }

  const expected: string[] = [];
  for (let ku = 16; ku <= 84; ku += 1) {
    for (let ten = 1; ten <= 94; ten += 1) {
      const char = decoder.decode(new Uint8Array([ku + 0xa0, ten + 0xa0]));
      // 未定義の区点は置換文字になるので捨てる
      if ([...char].length === 1 && char !== "\uFFFD") expected.push(char);
    }
  }

  const byCodePoint = (a: string, b: string) => a.codePointAt(0)! - b.codePointAt(0)!;
  const expectedSorted = expected.sort(byCodePoint);
  const actualSorted = [...new Set(actual)].sort(byCodePoint);

  assertEquals(
    actual.length,
    actualSorted.length,
    `${JIS_X_0208_PATH} に重複した文字があります (${actual.length} 文字中 ${actualSorted.length} 種類)`,
  );

  const missing = expectedSorted.filter((char) => !actualSorted.includes(char));
  const extra = actualSorted.filter((char) => !expectedSorted.includes(char));
  const describe = (chars: string[]) =>
    chars.map((char) => `${toCodePointLabel(char)} ${JSON.stringify(char)}`).join(", ");

  assertEquals(
    `${actualSorted.length}/${expectedSorted.length}`,
    `${expectedSorted.length}/${expectedSorted.length}`,
    `${JIS_X_0208_PATH} が JIS X 0208 の漢字と一致しません。\n` +
      (missing.length > 0 ? `  不足 (${missing.length}): ${describe(missing)}\n` : "") +
      (extra.length > 0 ? `  余分 (${extra.length}): ${describe(extra)}\n` : "") +
      `この一覧は「どの漢字をフォントに入れるか」の定義です。` +
      `記事やカードで新しい文字が必要になったら、この一覧ではなく ` +
      `${CHARSET_RANGES_PATH} にレンジを追記してください。`,
  );
});
