import { connection } from "next/server";
import { getDb } from "./db";

export type Book = {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  era: string | null;
  category: string;
  description: string | null;
  spineColor: string;
  sourceName: string;
  sourceUrl: string;
  license: string | null;
  sectionCount: number;
  charCount: number;
};

export type Section = {
  id: number;
  parentId: number | null;
  position: number;
  depth: number;
  title: string;
  hasBody: boolean;
};

export type SectionWithBody = Section & { body: string };

const BOOK_COLUMNS = `
  b.id, b.slug, b.title, b.author, b.era, b.category, b.description,
  b.spine_color AS spineColor, b.source_name AS sourceName,
  b.source_url AS sourceUrl, b.license,
  (SELECT COUNT(*) FROM sections s WHERE s.book_id = b.id) AS sectionCount,
  (SELECT COALESCE(SUM(LENGTH(s.body)), 0) FROM sections s WHERE s.book_id = b.id) AS charCount`;

const SECTION_COLUMNS = `
  id, parent_id AS parentId, position, depth, title, LENGTH(body) > 0 AS hasBody`;

// better-sqlite3 は同期的に結果を返すため、connection() でリクエスト時に読むことを明示する
export async function listBooks(): Promise<Book[]> {
  await connection();
  return getDb()
    .prepare(`SELECT ${BOOK_COLUMNS} FROM books b ORDER BY b.category, b.position`)
    .all() as Book[];
}

export async function getBook(slug: string): Promise<Book | undefined> {
  await connection();
  return getDb()
    .prepare(`SELECT ${BOOK_COLUMNS} FROM books b WHERE b.slug = ?`)
    .get(slug) as Book | undefined;
}

export async function listSections(bookId: number): Promise<Section[]> {
  await connection();
  const rows = getDb()
    .prepare(`SELECT ${SECTION_COLUMNS} FROM sections WHERE book_id = ? ORDER BY position`)
    .all(bookId) as (Omit<Section, "hasBody"> & { hasBody: number })[];
  return rows.map((r) => ({ ...r, hasBody: r.hasBody === 1 }));
}

export async function getSection(
  bookId: number,
  sectionId: number,
): Promise<SectionWithBody | undefined> {
  await connection();
  const row = getDb()
    .prepare(`SELECT ${SECTION_COLUMNS}, body FROM sections WHERE book_id = ? AND id = ?`)
    .get(bookId, sectionId) as
    | (Omit<SectionWithBody, "hasBody"> & { hasBody: number })
    | undefined;
  return row && { ...row, hasBody: row.hasBody === 1 };
}
