/**
 * SQLite に入っている本を、本のフォルダ（structure/original/）に書き出す。
 *
 *   npm run export                       すべての本
 *   npm run export -- xiaojing lunyu     slug を指定
 *   npm run export -- --out <置き場>      書き出し先（既定は BOKASAFN_BOOKS_DIR、無ければ data/books）
 *   npm run export -- --force            既にある structure/original/ を作り直す
 *
 * 形式は Tyggja の structure/original/（index.json とセクション単位のファイル）と同じ。
 * 形式の正本は、Tyggja のリポジトリの schema/ と README。
 *
 * スキャンした本を前提にした項目には、次の値を入れる。
 *   - ページ        : 取り込んだ 1 つのセクション（篇）を、1 ページとして扱う（p001_1 …）
 *   - 要素の source : 見出しをブロック 0、段落を 1 から数える（p001_1#1 …）
 *   - index の source: 元データを本のフォルダの source.json に保存し、その名前と SHA-256 を入れる
 *
 * 作り直すと ID が振り直され、Melta が作った版との ID による対応が取れなくなる。
 * そのため、既にある structure/original/ は --force が無ければ上書きしない。
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../src/lib/db";

/** 1 ファイルの上限（JSON の文字数）。超えるセクションは、子のセクションごとに分ける */
const SPLIT_CHARS = 12000;
const SOURCE_FILE = "source.json";

type Row = {
  id: number;
  parent_id: number | null;
  position: number;
  depth: number;
  title: string;
  body: string;
};

type Sentence = { id: string; text: string };
type Paragraph = { type: "paragraph"; id: string; source: string[]; sentences: Sentence[] };
type SectionNode = {
  type: "section";
  id: string;
  level: number;
  title: string;
  source: string[];
  children: (Paragraph | SectionNode | SectionRef)[];
};
type SectionRef = { type: "section_ref"; id: string; level: number; title: string; file: string };
type Ancestor = { id: string; level: number; title: string };
type TocNode = { id: string; level: number; title: string; file: string; children: TocNode[] };
type FileEntry = { file: string; id: string; chars: number; json_chars: number };

/**
 * 本文を段落に分ける。空行と改行は、どちらも段落の区切りとして扱う。
 * 行の前後の空白（字下げの全角空白を含む）は落とす。
 */
function paragraphsOf(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/**
 * 段落をセンテンスに分ける。全角の「。」「！」「？」と、その直後の閉じ括弧までを 1 文とする。
 * 連結すると、元の段落に戻る。
 */
function sentencesOf(paragraph: string): string[] {
  const parts = paragraph.match(/[^。！？]*[。！？]+[」』）》〕】]*|[^。！？]+$/g);
  return parts && parts.join("") === paragraph ? parts : [paragraph];
}

function charsOf(node: SectionNode): number {
  let n = 0;
  for (const c of node.children) {
    if (c.type === "paragraph") n += c.sentences.reduce((a, s) => a + s.text.length, 0);
    else if (c.type === "section") n += charsOf(c);
  }
  return n;
}

function exportBook(slug: string, outRoot: string, force: boolean): string {
  const db = getDb();
  const book = db.prepare("SELECT * FROM books WHERE slug = ?").get(slug) as
    | { id: number; title: string }
    | undefined;
  if (!book) throw new Error(`本が見つかりません: ${slug}`);

  const bookDir = path.join(outRoot, slug);
  const dir = path.join(bookDir, "structure", "original");
  if (fs.existsSync(dir)) {
    if (!force) return `${slug}: 既にあるので飛ばしました（作り直すには --force）`;
    fs.rmSync(dir, { recursive: true });
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

  // 1. 本の全体を、1 本の木にする
  const pages: { id: string; status: "ok"; decorations: never[] }[] = [];
  let paragraphCount = 0;
  let sentenceCount = 0;
  const build = (row: Row, id: string, level: number): SectionNode => {
    const pageId = `p${String(pages.length + 1).padStart(3, "0")}_1`;
    pages.push({ id: pageId, status: "ok", decorations: [] });
    const children: SectionNode["children"] = [];
    paragraphsOf(row.body).forEach((text, i) => {
      const pid = `p${++paragraphCount}`;
      const sentences = sentencesOf(text).map((t, j) => ({ id: `${pid}.${j + 1}`, text: t }));
      sentenceCount += sentences.length;
      children.push({ type: "paragraph", id: pid, source: [`${pageId}#${i + 1}`], sentences });
    });
    (childrenOf.get(row.id) ?? []).forEach((child, i) => {
      children.push(build(child, `${id}.${i + 1}`, level + 1));
    });
    return { type: "section", id, level, title: row.title, source: [`${pageId}#0`], children };
  };
  const roots = (childrenOf.get(0) ?? []).map((row, i) => build(row, `s${i + 1}`, 1));

  // 2. ファイルに分けて書く。上限を超えるセクションは、子のセクションを別のファイルに出す
  fs.mkdirSync(dir, { recursive: true });
  const files: FileEntry[] = [];
  const serialize = (file: string, node: SectionNode, ancestors: Ancestor[]) =>
    JSON.stringify({ version: 2, file, id: node.id, ancestors, body: [node] }, null, 2) + "\n";

  const emit = (node: SectionNode, ancestors: Ancestor[]): TocNode => {
    const file = `${String(files.length + 1).padStart(3, "0")}_${node.id}.json`;
    const entry: FileEntry = { file, id: node.id, chars: 0, json_chars: 0 };
    files.push(entry);

    const tocInline = (n: SectionNode): TocNode => ({
      id: n.id,
      level: n.level,
      title: n.title,
      file,
      children: n.children.filter((c) => c.type === "section").map((c) => tocInline(c)),
    });

    let out = node;
    let toc = tocInline(node);
    const hasChildSections = node.children.some((c) => c.type === "section");
    if (hasChildSections && serialize(file, node, ancestors).length > SPLIT_CHARS) {
      const self = { id: node.id, level: node.level, title: node.title };
      const tocChildren: TocNode[] = [];
      const children = node.children.map((c) => {
        if (c.type !== "section") return c;
        const childToc = emit(c, [...ancestors, self]);
        tocChildren.push(childToc);
        const ref: SectionRef = {
          type: "section_ref",
          id: c.id,
          level: c.level,
          title: c.title,
          file: childToc.file,
        };
        return ref;
      });
      out = { ...node, children };
      toc = { id: node.id, level: node.level, title: node.title, file, children: tocChildren };
    }

    const text = serialize(file, out, ancestors);
    fs.writeFileSync(path.join(dir, file), text);
    entry.chars = charsOf(out);
    entry.json_chars = text.length;
    return toc;
  };
  const toc = roots.map((root) => emit(root, []));

  // 3. 元データと index.json を書く
  const sourceText = JSON.stringify({ book, authors, sections: rows }, null, 1) + "\n";
  fs.writeFileSync(path.join(bookDir, SOURCE_FILE), sourceText);
  const sha256 = crypto.createHash("sha256").update(sourceText).digest("hex");
  const index = {
    version: 2,
    title: book.title,
    source: { book: SOURCE_FILE, sha256 },
    split_chars: SPLIT_CHARS,
    pages,
    files,
    toc,
  };
  fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify(index, null, 2) + "\n");

  const over = files.filter((f) => f.json_chars > SPLIT_CHARS).length;
  return (
    `${slug}: ファイル ${files.length} / セクション ${rows.length} / パラグラフ ${paragraphCount}` +
    ` / センテンス ${sentenceCount}` +
    (over > 0 ? ` / 上限を超えるファイル ${over}` : "")
  );
}

function main() {
  const args = process.argv.slice(2);
  let outRoot = process.env.BOKASAFN_BOOKS_DIR ?? path.join(process.cwd(), "data", "books");
  let force = false;
  const slugs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out") outRoot = args[++i];
    else if (args[i] === "--force") force = true;
    else slugs.push(args[i]);
  }
  if (!outRoot) throw new Error("--out に書き出し先を指定してください");

  const targets =
    slugs.length > 0
      ? slugs
      : (getDb().prepare("SELECT slug FROM books ORDER BY position, id").all() as { slug: string }[]).map(
          (b) => b.slug,
        );
  console.log(`書き出し先: ${path.resolve(outRoot)}`);
  for (const slug of targets) console.log(exportBook(slug, outRoot, force));
}

main();
