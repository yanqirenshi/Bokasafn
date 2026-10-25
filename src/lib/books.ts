import { connection } from "next/server";
import type { AuthorRole } from "./authors";
import { getDb } from "./db";

export type BookAuthor = { id: number; name: string; role: AuthorRole };

export type Book = {
  id: number;
  slug: string;
  title: string;
  /** 本の中での並び順に並んだ著者 */
  authors: BookAuthor[];
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
  b.id, b.slug, b.title, b.era, b.category, b.description,
  b.spine_color AS spineColor, b.source_name AS sourceName,
  b.source_url AS sourceUrl, b.license,
  (SELECT COUNT(*) FROM sections s WHERE s.book_id = b.id) AS sectionCount,
  (SELECT COALESCE(SUM(LENGTH(s.body)), 0) FROM sections s WHERE s.book_id = b.id) AS charCount`;

const SECTION_COLUMNS = `
  id, parent_id AS parentId, position, depth, title, LENGTH(body) > 0 AS hasBody`;

type BookRow = Omit<Book, "authors">;

/** 本の行に、book_authors から著者を付ける */
function withAuthors(rows: BookRow[]): Book[] {
  const credits = getDb()
    .prepare(
      `SELECT ba.book_id AS bookId, a.id, a.name, ba.role
       FROM book_authors ba JOIN authors a ON a.id = ba.author_id
       ORDER BY ba.book_id, ba.position`,
    )
    .all() as (BookAuthor & { bookId: number })[];
  const byBook = Map.groupBy(credits, (c) => c.bookId);
  return rows.map((row) => ({
    ...row,
    authors: (byBook.get(row.id) ?? []).map(({ id, name, role }) => ({ id, name, role })),
  }));
}

// better-sqlite3 は同期的に結果を返すため、connection() でリクエスト時に読むことを明示する
export async function listBooks(): Promise<Book[]> {
  await connection();
  const rows = getDb()
    // 分類名ではなく取り込み順に並べる（本棚の既定の配置が分類を足しても変わらないように）
    .prepare(`SELECT ${BOOK_COLUMNS} FROM books b ORDER BY b.position`)
    .all() as BookRow[];
  return withAuthors(rows);
}

/** 本棚のインスペクターに出す情報（最初に読むセクションと、最上位の章立て）付きの本 */
export type ShelfBook = Book & {
  firstSectionId: number | null;
  chapters: string[];
};

export async function listShelfBooks(): Promise<ShelfBook[]> {
  const books = await listBooks();
  const db = getDb();
  const firstSection = db.prepare(
    "SELECT id FROM sections WHERE book_id = ? AND LENGTH(body) > 0 ORDER BY position LIMIT 1",
  );
  const chapters = db.prepare(
    "SELECT title FROM sections WHERE book_id = ? AND depth = 0 ORDER BY position",
  );
  return books.map((book) => ({
    ...book,
    firstSectionId: (firstSection.get(book.id) as { id: number } | undefined)?.id ?? null,
    chapters: (chapters.all(book.id) as { title: string }[]).map((c) => c.title),
  }));
}

export async function getBook(slug: string): Promise<Book | undefined> {
  await connection();
  const row = getDb()
    .prepare(`SELECT ${BOOK_COLUMNS} FROM books b WHERE b.slug = ?`)
    .get(slug) as BookRow | undefined;
  return row && withAuthors([row])[0];
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
