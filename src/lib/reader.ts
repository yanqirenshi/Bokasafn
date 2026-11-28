import type { BodyNode, BookIndex, Part, TocEntry } from "@yanqirenshi/frasoga";
import type { StructureIndex, StructurePart, TocNode } from "./structure";

// 本のフォルダの JSON を、Frasoga の表示コンポーネントに渡す形にする。
// ブラウザに送るので、表示に要るものだけを残す。

function tocEntry(node: TocNode): TocEntry {
  return {
    id: node.id,
    title: node.title,
    level: node.level,
    file: node.file,
    children: node.children.map(tocEntry),
  };
}

/** 目次（index.json）を、Frasoga に渡す形にする */
export function toReaderIndex(index: StructureIndex): BookIndex {
  return {
    title: index.title,
    files: index.files.map(({ file, id }) => ({ file, id })),
    toc: index.toc.map(tocEntry),
  };
}

/**
 * 本文の 1 ファイルを、Frasoga に渡す形にする。
 * 要素は、そのまま渡す。図の文字は文字列のこともあるが、Frasoga（0.2.1 から）が配列として扱う。
 * Frasoga の型は配列だけなので、ここで型を合わせる。
 */
export function toReaderPart(part: StructurePart): Part {
  return { file: part.file, body: part.body as BodyNode[] };
}
