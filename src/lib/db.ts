import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { parseAuthors, type AuthorCredit } from "./authors";
import { DEFAULT_BOOKCASE_SETTINGS } from "./bookcase-settings";

export const DB_PATH =
  process.env.BOKASAFN_DB ?? path.join(process.cwd(), "data", "bokasafn.db");

const SCHEMA = `
-- ユーザー。いまは既定のユーザーが 1 人だけ居る（ログインは、まだ無い）。
CREATE TABLE IF NOT EXISTS user (
  id           INTEGER PRIMARY KEY,
  name         TEXT    NOT NULL,
  description  TEXT,
  created_at   TEXT    NOT NULL,
  created_by   INTEGER REFERENCES user(id),
  updated_at   TEXT    NOT NULL,
  updated_by   INTEGER REFERENCES user(id)
);

-- 冊子。本のフォルダの、ある版を、1 冊として棚に置いたもの。
-- 本の内容は持たず、どこにあるか（folder と edition）だけを持つ。
CREATE TABLE IF NOT EXISTS booklet (
  id           INTEGER PRIMARY KEY,
  slug         TEXT    NOT NULL UNIQUE,
  name         TEXT    NOT NULL,
  era          TEXT,
  category     TEXT    NOT NULL,
  description  TEXT,
  spine_color  TEXT    NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0,
  source_name  TEXT    NOT NULL,
  source_url   TEXT    NOT NULL,
  license      TEXT,
  imported_at  TEXT    NOT NULL,
  -- 本を置く本棚。以前の DB には ALTER TABLE で足すため、NULL を許す。
  bookcase_key TEXT    REFERENCES bookcase(key),
  -- 本のフォルダ。本の置き場（BOKASAFN_BOOKS_DIR）からの相対パス。
  -- 一つのフォルダを、複数の冊子から指してよい（原本の冊子と、校正した版の冊子など）。
  folder       TEXT    NOT NULL DEFAULT '',
  -- 読む版（structure/<版>/ の名前）。NULL なら、最新の版を読む。
  edition      TEXT,
  created_at   TEXT    NOT NULL DEFAULT '',
  created_by   INTEGER REFERENCES user(id),
  updated_at   TEXT    NOT NULL DEFAULT '',
  updated_by   INTEGER REFERENCES user(id)
);

-- 巻・篇などの階層。本文 (body) は段落を空行で区切ったプレーンテキスト。
CREATE TABLE IF NOT EXISTS sections (
  id         INTEGER PRIMARY KEY,
  book_id    INTEGER NOT NULL REFERENCES booklet(id) ON DELETE CASCADE,
  parent_id  INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL,
  depth      INTEGER NOT NULL,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS sections_book ON sections(book_id, position);

-- 著者。複数の本を書いた人も一行にまとめる。
CREATE TABLE IF NOT EXISTS authors (
  id    INTEGER PRIMARY KEY,
  name  TEXT    NOT NULL UNIQUE
);

-- 本と著者の対応。役割は 著・編・注・託名 のいずれか。position は本の中での著者の並び順。
CREATE TABLE IF NOT EXISTS book_authors (
  book_id    INTEGER NOT NULL REFERENCES booklet(id) ON DELETE CASCADE,
  author_id  INTEGER NOT NULL REFERENCES authors(id),
  role       TEXT    NOT NULL,
  position   INTEGER NOT NULL,
  PRIMARY KEY (book_id, author_id)
);

CREATE INDEX IF NOT EXISTS book_authors_author ON book_authors(author_id);

-- 本棚。名札に出す名前と、段数・最小横幅（本が入りきらなければ横幅はこれより広がる）。
-- key は「分類:0」の形で、位置 (bookcase_positions) もこの key で持つ。
CREATE TABLE IF NOT EXISTS bookcase (
  key         TEXT PRIMARY KEY,
  name        TEXT    NOT NULL,
  shelf_rows  INTEGER NOT NULL,
  min_width   REAL    NOT NULL,
  updated_at  TEXT    NOT NULL
);

-- 本棚の画面上の位置（SVG 座標）。ドラッグで動かした本棚だけが入る。
CREATE TABLE IF NOT EXISTS bookcase_positions (
  key         TEXT PRIMARY KEY REFERENCES bookcase(key) ON DELETE CASCADE,
  x           REAL NOT NULL,
  y           REAL NOT NULL,
  updated_at  TEXT NOT NULL
);

-- 本棚の画面のカメラ（SVG の viewBox）。key ごとに一つ（いまは 'library' だけ）。
CREATE TABLE IF NOT EXISTS camera_views (
  key         TEXT PRIMARY KEY,
  x           REAL NOT NULL,
  y           REAL NOT NULL,
  w           REAL NOT NULL,
  h           REAL NOT NULL,
  updated_at  TEXT NOT NULL
);
`;

// 以前の名前のテーブルが残っていれば、データごと今の名前に変える。
function renameOldTables(db: Database.Database) {
  const exists = (name: string) =>
    db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) !== undefined;
  if (exists("bookcase_settings") && !exists("bookcase")) {
    db.exec("ALTER TABLE bookcase_settings RENAME TO bookcase");
  }
  // books は booklet に、books.title は booklet.name に変えた。
  // sections と book_authors の外部キーは、SQLite が新しい名前に付け替える。
  if (exists("books") && !exists("booklet")) {
    db.transaction(() => {
      db.exec("ALTER TABLE books RENAME TO booklet");
      db.exec("ALTER TABLE booklet RENAME COLUMN title TO name");
    })();
  }
}

/** 本棚の key（「分類:0」）から、既定の名前（分類）を取り出す SQL の式 */
const NAME_FROM_KEY = "CASE WHEN key LIKE '%:0' THEN substr(key, 1, length(key) - 2) ELSE key END";

/** 本棚の key。いまは分類ごとに一つで、「分類:0」の形 */
export function bookcaseKeyOf(category: string) {
  return `${category}:0`;
}

/** 本棚がまだ無ければ、分類の名前と既定の設定で作る */
export function ensureBookcase(db: Database.Database, key: string, name: string) {
  const { shelfRows, minWidth } = DEFAULT_BOOKCASE_SETTINGS;
  db.prepare(
    `INSERT OR IGNORE INTO bookcase (key, name, shelf_rows, min_width, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
  ).run(key, name, shelfRows, minWidth);
}

// 以前の bookcase には名前の列が無いので足し、key から名前を入れる。
function addBookcaseName(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(bookcase)").all() as { name: string }[];
  if (columns.some((c) => c.name === "name")) return;
  db.transaction(() => {
    db.exec("ALTER TABLE bookcase ADD COLUMN name TEXT NOT NULL DEFAULT ''");
    db.exec(`UPDATE bookcase SET name = ${NAME_FROM_KEY}`);
  })();
}

/** 最初から居る、既定のユーザーの ID */
export const DEFAULT_USER_ID = 1;

// 既定のユーザーがまだ居なければ作る。
function ensureDefaultUser(db: Database.Database) {
  db.prepare(
    `INSERT OR IGNORE INTO user (id, name, description, created_at, created_by, updated_at, updated_by)
     VALUES (?, 'owner', '最初から居る既定のユーザー', datetime('now'), ?, datetime('now'), ?)`,
  ).run(DEFAULT_USER_ID, DEFAULT_USER_ID, DEFAULT_USER_ID);
}

// 以前の booklet（books）には、本のフォルダと版・作成と更新の列が無いので足す。
// 本のフォルダは slug と同じ名前、作成と更新は取り込んだ日時と既定のユーザーにする。
function addBookletLinkColumns(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(booklet)").all() as { name: string }[];
  const has = (name: string) => columns.some((c) => c.name === name);
  const add = (name: string, type: string) => {
    if (!has(name)) db.exec(`ALTER TABLE booklet ADD COLUMN ${name} ${type}`);
  };
  db.transaction(() => {
    add("folder", "TEXT NOT NULL DEFAULT ''");
    add("edition", "TEXT");
    add("created_at", "TEXT NOT NULL DEFAULT ''");
    add("created_by", "INTEGER REFERENCES user(id)");
    add("updated_at", "TEXT NOT NULL DEFAULT ''");
    add("updated_by", "INTEGER REFERENCES user(id)");
    db.exec("UPDATE booklet SET folder = slug WHERE folder = ''");
    db.exec("UPDATE booklet SET created_at = imported_at WHERE created_at = ''");
    db.exec("UPDATE booklet SET updated_at = imported_at WHERE updated_at = ''");
    db.prepare("UPDATE booklet SET created_by = ? WHERE created_by IS NULL").run(DEFAULT_USER_ID);
    db.prepare("UPDATE booklet SET updated_by = ? WHERE updated_by IS NULL").run(DEFAULT_USER_ID);
  })();
}

// 以前の booklet（books）には本棚の列が無いので足す。
// 本棚の決まっていない本は、分類ごとの本棚（無ければ作る）に置く。
function placeBooksOnBookcases(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(booklet)").all() as { name: string }[];
  db.transaction(() => {
    if (!columns.some((c) => c.name === "bookcase_key")) {
      db.exec("ALTER TABLE booklet ADD COLUMN bookcase_key TEXT REFERENCES bookcase(key)");
    }
    const categories = db
      .prepare("SELECT DISTINCT category FROM booklet WHERE bookcase_key IS NULL")
      .all() as { category: string }[];
    const place = db.prepare(
      "UPDATE booklet SET bookcase_key = ? WHERE category = ? AND bookcase_key IS NULL",
    );
    for (const { category } of categories) {
      ensureBookcase(db, bookcaseKeyOf(category), category);
      place.run(bookcaseKeyOf(category), category);
    }
    db.exec("DROP INDEX IF EXISTS books_bookcase");
    db.exec("CREATE INDEX IF NOT EXISTS booklet_bookcase ON booklet(bookcase_key)");
  })();
}

// 外部キーの無い以前の bookcase_positions を作り直す。
// 位置だけあって設定の無い本棚は、既定の設定で bookcase に入れてから移す。
function addBookcasePositionsForeignKey(db: Database.Database) {
  const fks = db.prepare("PRAGMA foreign_key_list(bookcase_positions)").all();
  if (fks.length > 0) return;
  const { shelfRows, minWidth } = DEFAULT_BOOKCASE_SETTINGS;
  db.transaction(() => {
    db.prepare(
      `INSERT OR IGNORE INTO bookcase (key, name, shelf_rows, min_width, updated_at)
       SELECT key, ${NAME_FROM_KEY}, ?, ?, datetime('now') FROM bookcase_positions`,
    ).run(shelfRows, minWidth);
    db.exec(`
      CREATE TABLE bookcase_positions_new (
        key         TEXT PRIMARY KEY REFERENCES bookcase(key) ON DELETE CASCADE,
        x           REAL NOT NULL,
        y           REAL NOT NULL,
        updated_at  TEXT NOT NULL
      );
      INSERT INTO bookcase_positions_new SELECT key, x, y, updated_at FROM bookcase_positions;
      DROP TABLE bookcase_positions;
      ALTER TABLE bookcase_positions_new RENAME TO bookcase_positions;
    `);
  })();
}

/** 本に著者を並び順どおりに結び付ける。著者がまだ無ければ作る */
export function addBookAuthors(
  db: Database.Database,
  bookId: number | bigint,
  credits: AuthorCredit[],
) {
  const insertAuthor = db.prepare("INSERT OR IGNORE INTO authors (name) VALUES (?)");
  const findAuthor = db.prepare("SELECT id FROM authors WHERE name = ?");
  const link = db.prepare(
    "INSERT OR IGNORE INTO book_authors (book_id, author_id, role, position) VALUES (?, ?, ?, ?)",
  );
  credits.forEach(({ name, role }, i) => {
    insertAuthor.run(name);
    const { id } = findAuthor.get(name) as { id: number };
    link.run(bookId, id, role, i);
  });
}

// 以前の booklet.author（著者の文字列）を、authors と book_authors に移してから列を消す。
function moveAuthorsOutOfBooks(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(booklet)").all() as { name: string }[];
  if (!columns.some((c) => c.name === "author")) return;
  db.transaction(() => {
    const books = db.prepare("SELECT id, author FROM booklet").all() as {
      id: number;
      author: string | null;
    }[];
    for (const book of books) addBookAuthors(db, book.id, parseAuthors(book.author));
    db.exec("ALTER TABLE booklet DROP COLUMN author");
  })();
}

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    renameOldTables(db);
    db.exec(SCHEMA);
    ensureDefaultUser(db);
    addBookletLinkColumns(db);
    addBookcaseName(db);
    addBookcasePositionsForeignKey(db);
    moveAuthorsOutOfBooks(db);
    placeBooksOnBookcases(db);
  }
  return db;
}
