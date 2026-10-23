import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

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

-- 本棚の画面上の位置（SVG 座標）。ドラッグで動かした本棚だけが入る。
CREATE TABLE IF NOT EXISTS bookcase_positions (
  key         TEXT PRIMARY KEY,
  x           REAL NOT NULL,
  y           REAL NOT NULL,
  updated_at  TEXT NOT NULL
);
`;

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(SCHEMA);
  }
  return db;
}
