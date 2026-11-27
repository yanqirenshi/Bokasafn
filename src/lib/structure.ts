/**
 * 本のフォルダ（<本の置き場>/<folder>/structure/<版>/）を読む。
 *
 * 形式は Tyggja の structure と同じで、正本は Tyggja のリポジトリの schema/ と README にある。
 * 読むときの決まり:
 *   - 知らないプロパティは無視する（Melta が、要素に origin や note を足すため）
 *   - ID は名前で、位置を表す番号ではない。並び順は、配列の順で決まる
 *   - センテンスが本文の正本。段落の本文は、sentences[].text を区切りなしで連結したもの
 *   - figure の src は、版のフォルダではなく、本のフォルダからの相対パス
 */
import fs from "node:fs";
import path from "node:path";

export type TocNode = {
  id: string;
  level: number;
  title: string;
  file: string;
  children: TocNode[];
};

export type StructureIndex = {
  version: number;
  title: string;
  files: { file: string; id: string | null; chars: number; json_chars: number }[];
  toc: TocNode[];
  /** Melta が作った版にだけある */
  edition?: { name: string; base: string; editor: string; created_at: string };
};

export type Sentence = { id: string; text: string };

export type StructureNode =
  | { type: "section"; id: string; level: number; title: string; children: StructureNode[] }
  | { type: "section_ref"; id: string; level: number; title: string; file: string }
  | { type: "paragraph"; id: string; sentences: Sentence[] }
  | { type: "list"; id: string; items: { id: string; sentences: Sentence[] }[] }
  | { type: "figure"; id: string; src: string; text: string[] | string }
  | { type: "caption"; id: string; text: string }
  | {
      type: "table";
      id: string;
      n_row: number;
      n_col: number;
      cells: { row: number; col: number; row_span: number; col_span: number; text: string }[];
    };

export type StructurePart = {
  version: number;
  file: string;
  /** 最初の見出しより前の本文（front）は null */
  id: string | null;
  ancestors: { id: string; level: number; title: string }[];
  body: StructureNode[];
};

/** 原本の版の名前。Tyggja などの取り込み元の道具が作る */
export const ORIGINAL_EDITION = "original";

/** 本の置き場。環境変数 BOKASAFN_BOOKS_DIR で指定する（既定は data/books） */
export function booksRoot(): string {
  return path.resolve(process.env.BOKASAFN_BOOKS_DIR ?? path.join(process.cwd(), "data", "books"));
}

/** 親のフォルダの中にあるパスだけを返す。外を指すパスは拒否する */
function inside(parent: string, ...segments: string[]): string {
  const resolved = path.resolve(parent, ...segments);
  const relative = path.relative(parent, resolved);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`フォルダの外を指しています: ${segments.join("/")}`);
  }
  return resolved;
}

/** 本のフォルダの絶対パス。folder は、本の置き場からの相対パス */
export function bookDir(folder: string): string {
  return inside(booksRoot(), folder);
}

/**
 * 本のフォルダにある版の名前の一覧。原本が先頭で、あとは Melta の連番（01_… 02_…）の順。
 * index.json の無いフォルダは、版として数えない。
 */
export function listEditions(folder: string): string[] {
  const dir = path.join(bookDir(folder), "structure");
  if (!fs.existsSync(dir)) return [];
  const names = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "index.json")))
    .map((e) => e.name);
  const editions = names.filter((n) => n !== ORIGINAL_EDITION).sort();
  return names.includes(ORIGINAL_EDITION) ? [ORIGINAL_EDITION, ...editions] : editions;
}

/**
 * 読む版を決める。指定があればその版、無ければ最新の版（連番の最も大きい版。無ければ原本）。
 * 読める版が無いときは undefined。
 */
export function resolveEdition(folder: string, edition: string | null): string | undefined {
  const editions = listEditions(folder);
  if (edition !== null) return editions.includes(edition) ? edition : undefined;
  return editions.at(-1);
}

function editionDir(folder: string, edition: string): string {
  return inside(path.join(bookDir(folder), "structure"), edition);
}

// ファイルの更新時刻が変わるまで、読んだ JSON を覚えておく。
// 本棚の画面が、すべての本の index.json を毎回読み直さずに済むようにするため。
const cache = new Map<string, { mtimeMs: number; value: unknown }>();

function readJson<T>(file: string): T {
  const { mtimeMs } = fs.statSync(file);
  const hit = cache.get(file);
  if (hit && hit.mtimeMs === mtimeMs) return hit.value as T;
  const value = JSON.parse(fs.readFileSync(file, "utf8")) as T;
  cache.set(file, { mtimeMs, value });
  return value;
}

/** 版の index.json（全体の情報と目次） */
export function readIndex(folder: string, edition: string): StructureIndex {
  return readJson<StructureIndex>(path.join(editionDir(folder, edition), "index.json"));
}

/** 版の、分けたファイル 1 つ。file は index.json の files や toc にある名前 */
export function readPart(folder: string, edition: string, file: string): StructurePart {
  return readJson<StructurePart>(inside(editionDir(folder, edition), file));
}

const FIGURE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/**
 * 本のフォルダの figures/ にある画像を読む。segments は figures/ からのパス。
 * figures/ の外を指すパス、画像でないファイル、無いファイルは undefined。
 */
export function readFigure(
  folder: string,
  segments: string[],
): { data: Buffer; contentType: string } | undefined {
  let file: string;
  try {
    file = inside(path.join(bookDir(folder), "figures"), ...segments);
  } catch {
    return undefined;
  }
  const contentType = FIGURE_TYPES[path.extname(file).toLowerCase()];
  if (!contentType || !fs.existsSync(file) || !fs.statSync(file).isFile()) return undefined;
  return { data: fs.readFileSync(file), contentType };
}

/** 目次を、読み順に平らに並べる */
export function flattenToc(toc: TocNode[]): TocNode[] {
  return toc.flatMap((node) => [node, ...flattenToc(node.children)]);
}

/** 段落や箇条書きの項目の本文。センテンスを区切りなしで連結する */
export function textOf(sentences: Sentence[]): string {
  return sentences.map((s) => s.text).join("");
}
