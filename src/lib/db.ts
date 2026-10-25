import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_BOOKCASE_SETTINGS } from "./bookcase-settings";

export const DB_PATH =
  process.env.BOKASAFN_DB ?? path.join(process.cwd(), "data", "bokasafn.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS books (
  id           INTEGER PRIMARY KEY,
  slug         TEXT    NOT NULL UNIQUE,
  title        TEXT    NOT NULL,
  author       TEXT,
  era          TEXT,
  category     TEXT    NOT NULL,
  description  TEXT,
  spine_color  TEXT    NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0,
  source_name  TEXT    NOT NULL,
  source_url   TEXT    NOT NULL,
  license      TEXT,
  imported_at  TEXT    NOT NULL
);

-- 巻・篇などの階層。本文 (body) は段落を空行で区切ったプレーンテキスト。
CREATE TABLE IF NOT EXISTS sections (
  id         INTEGER PRIMARY KEY,
  book_id    INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  parent_id  INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL,
  depth      INTEGER NOT NULL,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS sections_book ON sections(book_id, position);

-- 本棚ごとの設定。段数と最小横幅（本が入りきらなければ横幅はこれより広がる）。
CREATE TABLE IF NOT EXISTS bookcase (
  key         TEXT PRIMARY KEY,
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
}

// 外部キーの無い以前の bookcase_positions を作り直す。
// 位置だけあって設定の無い本棚は、既定の設定で bookcase に入れてから移す。
function addBookcasePositionsForeignKey(db: Database.Database) {
  const fks = db.prepare("PRAGMA foreign_key_list(bookcase_positions)").all();
  if (fks.length > 0) return;
  const { shelfRows, minWidth } = DEFAULT_BOOKCASE_SETTINGS;
  db.transaction(() => {
    db.prepare(
      `INSERT OR IGNORE INTO bookcase (key, shelf_rows, min_width, updated_at)
       SELECT key, ?, ?, datetime('now') FROM bookcase_positions`,
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

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    renameOldTables(db);
    db.exec(SCHEMA);
    addBookcasePositionsForeignKey(db);
  }
  return db;
}
