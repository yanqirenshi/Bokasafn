import type { BodyNode, BookIndex, Part, TocEntry } from "@yanqirenshi/frasoga";
import type { StructureIndex, StructureNode, StructurePart, TocNode } from "./structure";

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

function bodyNode(node: StructureNode): BodyNode {
  switch (node.type) {
    case "section":
      return { ...node, children: node.children.map(bodyNode) };
    case "figure":
      // 図の文字は、文字列のこともある。Frasoga は配列を前提にしている
      return {
        type: "figure",
        id: node.id,
        src: node.src || null,
        text: Array.isArray(node.text) ? node.text : node.text ? [node.text] : [],
      };
    default:
      return node;
  }
}

/** 本文の 1 ファイルを、Frasoga に渡す形にする */
export function toReaderPart(part: StructurePart): Part {
  return { file: part.file, body: part.body.map(bodyNode) };
}
