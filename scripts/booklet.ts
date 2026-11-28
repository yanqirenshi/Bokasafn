/**
 * 冊子（booklet）を登録・変更する。
 * Tyggja・Melta が作った本のフォルダを、棚に置く 1 冊として登録するときに使う。
 *
 *   npm run booklet -- list
 *       冊子の一覧と、まだ冊子になっていない本のフォルダを出す
 *
 *   npm run booklet -- add <本のフォルダ> --slug <名前> --category <分類> [項目…]
 *       本のフォルダを、冊子として登録する。<本のフォルダ> は、本の置き場からの相対パス
 *         --name <名前>         冊子の名前（既定は index.json の title）
 *         --edition <版>        読む版（既定は最新の版）
 *         --author <著者>       「張三」「李四 編」「託名 黃帝・岐伯」の書き方
 *         --era <時代>  --description <説明>  --color <背表紙の色 #rrggbb>
 *         --source-name <出典の名前>  --source-url <出典の URL>  --license <ライセンス>
 *
 *   npm run booklet -- set <slug> [--edition <版>|latest] [--folder <本のフォルダ>] [--name <名前>]
 *       冊子の、読む版・本のフォルダ・名前を変える
 *
 * 本の置き場は、環境変数 BOKASAFN_BOOKS_DIR で指定する（.env.local に書ける。既定は data/books）。
 */
import fs from "node:fs";
import path from "node:path";
import { parseAuthors } from "../src/lib/authors";
import { addBookAuthors, bookcaseKeyOf, DEFAULT_USER_ID, ensureBookcase, getDb } from "../src/lib/db";
import { bookDir, booksRoot, listEditions, readIndex, resolveEdition } from "../src/lib/structure";

/** 背表紙の色。色の指定が無いときは、slug から決まった色を選ぶ */
const SPINE_COLORS = [
  "#2f4a3a", "#5b4a1f", "#1f3550", "#4a2f55", "#2d4a5a", "#3b5a3a",
  "#6a4a2a", "#5a3a4a", "#4a4a2a", "#2a3a5a", "#6a2a2a", "#2a4a6a",
];

/** 本のフォルダを探す深さ。置き場の直下と、その 2 段下まで */
const SEARCH_DEPTH = 3;

type Options = Record<string, string>;

function parseArgs(args: string[]): { positional: string[]; options: Options } {
  const positional: string[] = [];
  const options: Options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const value = args[i + 1];
      if (value === undefined) throw new Error(`${args[i]} に値がありません`);
      options[args[i].slice(2)] = value;
      i++;
    } else {
      positional.push(args[i]);
    }
  }
  return { positional, options };
}

/** 本のフォルダの書き方をそろえる（区切りは /、前後の / は取る） */
function normalizeFolder(folder: string): string {
  return folder.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
}

/** 読める版が無いときに、理由を伝えるエラーを作る */
function noEditionError(folder: string): Error {
  const dir = bookDir(folder);
  if (!fs.existsSync(dir)) return new Error(`本のフォルダがありません: ${dir}`);
  if (fs.existsSync(path.join(dir, "structure", "index.json"))) {
    return new Error(
      `古い配置の本のフォルダです（structure/original/ がありません）。` +
        `先に Tyggja で原本を作ってください: tyggja structure "${dir}"`,
    );
  }
  return new Error(`読める版がありません（structure/original/index.json が要ります）: ${dir}`);
}

function colorOf(slug: string): string {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return SPINE_COLORS[hash % SPINE_COLORS.length];
}

/** 置き場の下の、本のフォルダ（structure/ を持つフォルダ）を探す */
function findBookFolders(): string[] {
  const root = booksRoot();
  const found: string[] = [];
  const walk = (dir: string, depth: number) => {
    if (fs.existsSync(path.join(dir, "structure"))) {
      found.push(normalizeFolder(path.relative(root, dir)));
      return;
    }
    if (depth >= SEARCH_DEPTH) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) walk(path.join(dir, entry.name), depth + 1);
    }
  };
  if (fs.existsSync(root)) walk(root, 0);
  return found.filter((f) => f !== "").sort();
}

function list() {
  const db = getDb();
  const booklets = db
    .prepare("SELECT slug, name, folder, edition FROM booklet ORDER BY position, id")
    .all() as { slug: string; name: string; folder: string; edition: string | null }[];

  console.log(`本の置き場: ${booksRoot()}`);
  console.log(`\n冊子（${booklets.length} 冊）`);
  for (const b of booklets) {
    let reading: string | undefined;
    try {
      reading = resolveEdition(b.folder, b.edition);
    } catch {
      reading = undefined;
    }
    const edition =
      reading === undefined
        ? `${b.edition ?? "最新"}（読めません）`
        : (b.edition ?? `最新 → ${reading}`);
    console.log(`  ${b.slug}\t${b.name}\t${b.folder}\t版: ${edition}`);
  }

  const used = new Set(booklets.map((b) => normalizeFolder(b.folder)));
  const free = findBookFolders().filter((f) => !used.has(f));
  console.log(`\nまだ冊子になっていない本のフォルダ（${free.length} 件）`);
  for (const folder of free) {
    const editions = listEditions(folder);
    const note =
      editions.length > 0
        ? `版: ${editions.join("、")}`
        : fs.existsSync(path.join(bookDir(folder), "structure", "index.json"))
          ? "古い配置（先に tyggja structure が要ります）"
          : "読める版がありません";
    console.log(`  ${folder}\t${note}`);
  }
}

function add(positional: string[], o: Options) {
  if (positional.length !== 1) throw new Error("本のフォルダを 1 つ指定してください");
  const folder = normalizeFolder(positional[0]);
  const slug = o.slug;
  if (!slug) throw new Error("--slug を指定してください（URL に使う名前）");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("--slug は、英小文字・数字・ハイフンで書いてください");
  }
  if (!o.category) throw new Error("--category を指定してください（置く本棚を決める分類）");
  if (o.color && !/^#[0-9a-fA-F]{6}$/.test(o.color)) {
    throw new Error("--color は #rrggbb の形で書いてください");
  }

  const edition = o.edition ?? null;
  const reading = resolveEdition(folder, edition);
  if (reading === undefined) {
    if (edition !== null && listEditions(folder).length > 0) {
      throw new Error(`版 ${edition} がありません（ある版: ${listEditions(folder).join("、")}）`);
    }
    throw noEditionError(folder);
  }
  const name = o.name ?? readIndex(folder, reading).title;

  const db = getDb();
  if (db.prepare("SELECT 1 FROM booklet WHERE slug = ?").get(slug)) {
    throw new Error(`slug ${slug} は、もう使われています`);
  }
  const id = db.transaction(() => {
    const bookcaseKey = bookcaseKeyOf(o.category);
    ensureBookcase(db, bookcaseKey, o.category);
    const { position } = db
      .prepare("SELECT COALESCE(MAX(position), -1) + 1 AS position FROM booklet")
      .get() as { position: number };
    const bookletId = db
      .prepare(
        `INSERT INTO booklet (slug, name, era, category, description, spine_color, position,
                              source_name, source_url, license, imported_at, bookcase_key,
                              folder, edition, created_at, created_by, updated_at, updated_by)
         VALUES (@slug, @name, @era, @category, @description, @spineColor, @position,
                 @sourceName, @sourceUrl, @license, datetime('now'), @bookcaseKey,
                 @folder, @edition, datetime('now'), @userId, datetime('now'), @userId)`,
      )
      .run({
        slug,
        name,
        era: o.era ?? null,
        category: o.category,
        description: o.description ?? null,
        spineColor: o.color ?? colorOf(slug),
        position,
        // 出典の無い本は、空にする（画面は、空なら出典を出さない）
        sourceName: o["source-name"] ?? "",
        sourceUrl: o["source-url"] ?? "",
        license: o.license ?? null,
        bookcaseKey,
        folder,
        edition,
        userId: DEFAULT_USER_ID,
      }).lastInsertRowid;
    addBookAuthors(db, bookletId, parseAuthors(o.author));
    return bookletId;
  })();
  console.log(`冊子を登録しました: ${slug}（ID ${id}）「${name}」 ${folder} 版: ${edition ?? `最新 → ${reading}`}`);
}

function set(positional: string[], o: Options) {
  if (positional.length !== 1) throw new Error("slug を 1 つ指定してください");
  const slug = positional[0];
  const db = getDb();
  const booklet = db.prepare("SELECT id, folder, edition FROM booklet WHERE slug = ?").get(slug) as
    | { id: number; folder: string; edition: string | null }
    | undefined;
  if (!booklet) throw new Error(`冊子が見つかりません: ${slug}`);
  if (!("edition" in o) && !("folder" in o) && !("name" in o)) {
    throw new Error("--edition・--folder・--name のどれかを指定してください");
  }

  const folder = "folder" in o ? normalizeFolder(o.folder) : booklet.folder;
  const edition = "edition" in o ? (o.edition === "latest" ? null : o.edition) : booklet.edition;
  const reading = resolveEdition(folder, edition);
  if (reading === undefined) {
    if (edition !== null && listEditions(folder).length > 0) {
      throw new Error(`版 ${edition} がありません（ある版: ${listEditions(folder).join("、")}）`);
    }
    throw noEditionError(folder);
  }

  db.prepare(
    `UPDATE booklet
     SET folder = @folder, edition = @edition, name = COALESCE(@name, name),
         updated_at = datetime('now'), updated_by = @userId
     WHERE id = @id`,
  ).run({ folder, edition, name: o.name ?? null, userId: DEFAULT_USER_ID, id: booklet.id });
  console.log(`冊子を変えました: ${slug} ${folder} 版: ${edition ?? `最新 → ${reading}`}`);
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { positional, options } = parseArgs(rest);
  if (command === "list") list();
  else if (command === "add") add(positional, options);
  else if (command === "set") set(positional, options);
  else throw new Error("list・add・set のどれかを指定してください（使い方は scripts/booklet.ts の先頭）");
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
