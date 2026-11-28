import { connection } from "next/server";
import type { BookIndex } from "@yanqirenshi/frasoga";
import type { AuthorRole } from "./authors";
import { getDb } from "./db";
import { toReaderIndex } from "./reader";
import {
  flattenToc,
  readIndex,
  readPart,
  resolveEdition,
  type StructureIndex,
  type StructurePart,
} from "./structure";

export type BookAuthor = { id: number; name: string; role: AuthorRole };

export type Book = {
  id: number;
  slug: string;
  title: string;
  /** 本の中での並び順に並んだ著者 */
  authors: BookAuthor[];
  era: string | null;
  category: string;
  /** 本を置いている本棚の key と名前 */
  bookcaseKey: string;
  bookcaseName: string;
  /** 本のフォルダ（本の置き場からの相対パス） */
  folder: string;
  /** 読む版の指定。null なら最新の版 */
  edition: string | null;
  /** 実際に読む版。本のフォルダや版が見つからなければ null */
  readingEdition: string | null;
  description: string | null;
  spineColor: string;
  sourceName: string;
  sourceUrl: string;
  license: string | null;
  sectionCount: number;
  charCount: number;
};

/** 最初の見出しより前の本文（front）のページの ID。セクションの ID（s1 …）とは重ならない */
export const FRONT_PAGE_ID = "front";
const FRONT_TITLE = "冒頭";

/** 目次の 1 行。本文の 1 ページは、分けたファイル 1 つ */
export type TocEntry = {
  /** セクションの ID */
  id: string;
  /** 0 が一番上 */
  depth: number;
  title: string;
  /** このセクションが載っているページの ID */
  pageId: string;
  /** ページの先頭のセクションなら true。false なら、ページの途中にある */
  isPage: boolean;
};

const BOOK_COLUMNS = `
  b.id, b.slug, b.name AS title, b.era, b.category, b.description,
  b.spine_color AS spineColor, b.source_name AS sourceName,
  b.source_url AS sourceUrl, b.license,
  b.bookcase_key AS bookcaseKey, b.folder, b.edition,
  (SELECT bc.name FROM bookcase bc WHERE bc.key = b.bookcase_key) AS bookcaseName`;

type BookRow = Omit<Book, "authors" | "readingEdition" | "sectionCount" | "charCount">;

/** 本のフォルダから、読む版と index.json を読む。見つからなければ undefined */
function readContents(
  folder: string,
  edition: string | null,
): { edition: string; index: StructureIndex } | undefined {
  try {
    const resolved = resolveEdition(folder, edition);
    return resolved === undefined ? undefined : { edition: resolved, index: readIndex(folder, resolved) };
  } catch {
    // フォルダの指定が置き場の外を指している、JSON が壊れている、など
    return undefined;
  }
}

/** 本の行に、book_authors の著者と、本のフォルダから数えた篇の数・字数を付ける */
function complete(rows: BookRow[]): Book[] {
  const credits = getDb()
    .prepare(
      `SELECT ba.book_id AS bookId, a.id, a.name, ba.role
       FROM book_authors ba JOIN authors a ON a.id = ba.author_id
       ORDER BY ba.book_id, ba.position`,
    )
    .all() as (BookAuthor & { bookId: number })[];
  const byBook = Map.groupBy(credits, (c) => c.bookId);
  return rows.map((row) => {
    const contents = readContents(row.folder, row.edition);
    return {
      ...row,
      authors: (byBook.get(row.id) ?? []).map(({ id, name, role }) => ({ id, name, role })),
      readingEdition: contents?.edition ?? null,
      sectionCount: contents ? flattenToc(contents.index.toc).length : 0,
      charCount: contents ? contents.index.files.reduce((sum, f) => sum + f.chars, 0) : 0,
    };
  });
}

// better-sqlite3 とファイルの読み込みは同期的に結果を返すため、connection() でリクエスト時に読むことを明示する
export async function listBooks(): Promise<Book[]> {
  await connection();
  const rows = getDb()
    // 分類名ではなく取り込み順に並べる（本棚の既定の配置が分類を足しても変わらないように）
    .prepare(`SELECT ${BOOK_COLUMNS} FROM booklet b ORDER BY b.position`)
    .all() as BookRow[];
  return complete(rows);
}

/** 本棚のインスペクターに出す情報（最初に読むページと、最上位の章立て）付きの本 */
export type ShelfBook = Book & {
  firstPageId: string | null;
  chapters: string[];
};

export async function listShelfBooks(): Promise<ShelfBook[]> {
  const books = await listBooks();
  return books.map((book) => {
    const index = book.readingEdition ? readIndex(book.folder, book.readingEdition) : undefined;
    return {
      ...book,
      firstPageId: index?.files[0] ? pageIdOf(index.files[0]) : null,
      chapters: index?.toc.map((node) => node.title) ?? [],
    };
  });
}

export async function getBook(slug: string): Promise<Book | undefined> {
  await connection();
  const row = getDb()
    .prepare(`SELECT ${BOOK_COLUMNS} FROM booklet b WHERE b.slug = ?`)
    .get(slug) as BookRow | undefined;
  return row && complete([row])[0];
}

function pageIdOf(file: { id: string | null }): string {
  return file.id ?? FRONT_PAGE_ID;
}

/** 本の目次と、ページの並び。本のフォルダが見つからなければ undefined */
export type BookContents = {
  /** 目次（読み順）。front があれば、先頭に「冒頭」が入る */
  toc: TocEntry[];
  /** ページの ID（読み順） */
  pageIds: string[];
};

export async function getContents(book: Book): Promise<BookContents | undefined> {
  await connection();
  if (!book.readingEdition) return undefined;
  const index = readIndex(book.folder, book.readingEdition);
  const pageOfFile = new Map(index.files.map((f) => [f.file, pageIdOf(f)]));
  const toc: TocEntry[] = flattenToc(index.toc).map((node) => {
    const pageId = pageOfFile.get(node.file) ?? node.id;
    return {
      id: node.id,
      depth: node.level - 1,
      title: node.title,
      pageId,
      isPage: pageId === node.id,
    };
  });
  if (index.files.some((f) => f.id === null)) {
    toc.unshift({ id: FRONT_PAGE_ID, depth: 0, title: FRONT_TITLE, pageId: FRONT_PAGE_ID, isPage: true });
  }
  return { toc, pageIds: index.files.map(pageIdOf) };
}

/** 目次の表示に渡すデータ（Frasoga の目次の形）。本のフォルダが見つからなければ undefined */
export async function getReaderIndex(book: Book): Promise<BookIndex | undefined> {
  await connection();
  if (!book.readingEdition) return undefined;
  return toReaderIndex(readIndex(book.folder, book.readingEdition));
}

/** 目次の行から、その場所へのリンク先を作る。ページの途中にあるセクションは、ページ内の位置を指す */
export function hrefOf(slug: string, entry: Pick<TocEntry, "id" | "pageId" | "isPage">): string {
  const page = `/books/${slug}/${encodeURIComponent(entry.pageId)}`;
  return entry.isPage ? page : `${page}#${encodeURIComponent(entry.id)}`;
}

/** 本文の 1 ページ（分けたファイル 1 つ）。見つからなければ undefined */
export async function getPage(book: Book, pageId: string): Promise<StructurePart | undefined> {
  await connection();
  if (!book.readingEdition) return undefined;
  const index = readIndex(book.folder, book.readingEdition);
  const file = index.files.find((f) => pageIdOf(f) === pageId);
  return file && readPart(book.folder, book.readingEdition, file.file);
}
