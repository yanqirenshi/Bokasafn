/**
 * 以前の DB（本文を sections テーブルに持っていた形）の本を、本のフォルダに書き出す。
 * 以前の DB から移るときにだけ使う。
 *
 *   npm run export                       すべての本
 *   npm run export -- xiaojing lunyu     slug を指定
 *   npm run export -- --out <置き場>      書き出し先（既定は BOKASAFN_BOOKS_DIR、無ければ data/books）
 *   npm run export -- --force            既にある structure/original/ を作り直す
 *
 * すべての本のフォルダがそろうと、次にアプリやスクリプトが DB を開いたときに、sections は消される。
 * 形式と、書き出しの決まりは、scripts/lib/write-structure.ts にある。
 *
 * 作り直すと ID が振り直され、Melta が作った版との ID による対応が取れなくなる。
 * そのため、既にある structure/original/ は --force が無ければ上書きしない。
 */
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../src/lib/db";
import { booksRoot } from "../src/lib/structure";
import { describeResult, writeOriginal, type SourceSection } from "./lib/write-structure";

type Row = {
  id: number;
  parent_id: number | null;
  position: number;
  depth: number;
  title: string;
  body: string;
};

function exportBook(slug: string, outRoot: string, force: boolean): string {
  const db = getDb();
  const book = db.prepare("SELECT * FROM booklet WHERE slug = ?").get(slug) as
    | { id: number; name: string; folder: string }
    | undefined;
  if (!book) throw new Error(`本が見つかりません: ${slug}`);

  const bookDir = path.join(outRoot, book.folder);
  if (fs.existsSync(path.join(bookDir, "structure", "original")) && !force) {
    return `${slug}: 既にあるので飛ばしました（作り直すには --force）`;
  }

  const rows = db
    .prepare(
      "SELECT id, parent_id, position, depth, title, body FROM sections WHERE book_id = ? ORDER BY position",
    )
    .all(book.id) as Row[];
  const authors = db
    .prepare(
      `SELECT a.name, ba.role FROM book_authors ba JOIN authors a ON a.id = ba.author_id
       WHERE ba.book_id = ? ORDER BY ba.position`,
    )
    .all(book.id);

  const childrenOf = new Map<number, Row[]>();
  for (const r of rows) {
    const key = r.parent_id ?? 0;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(r);
  }
  const toSource = (row: Row): SourceSection => ({
    title: row.title,
    body: row.body,
    children: (childrenOf.get(row.id) ?? []).map(toSource),
  });

  const result = writeOriginal(bookDir, {
    title: book.name,
    source: { book, authors, sections: rows },
    sections: (childrenOf.get(0) ?? []).map(toSource),
  });
  return `${slug}: ${describeResult(result)}`;
}

function main() {
  const args = process.argv.slice(2);
  let outRoot = booksRoot();
  let force = false;
  const slugs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out") outRoot = args[++i];
    else if (args[i] === "--force") force = true;
    else slugs.push(args[i]);
  }
  if (!outRoot) throw new Error("--out に書き出し先を指定してください");

  const db = getDb();
  const hasSections =
    db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'sections'").get() !==
    undefined;
  if (!hasSections) {
    console.log("この DB には sections がありません。本の内容は、もう本のフォルダにあります。");
    return;
  }

  const targets =
    slugs.length > 0
      ? slugs
      : (db.prepare("SELECT slug FROM booklet ORDER BY position, id").all() as { slug: string }[]).map(
          (b) => b.slug,
        );
  console.log(`書き出し先: ${path.resolve(outRoot)}`);
  for (const slug of targets) console.log(exportBook(slug, outRoot, force));
}

main();
