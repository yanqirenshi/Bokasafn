"use client";

import { StructureToc, type BookIndex } from "@yanqirenshi/frasoga";
import "@yanqirenshi/frasoga/style.css";
import { hrefForBook, ReaderLink } from "./links";
import styles from "./reader.module.css";

/**
 * 本の目次。Frasoga の目次を、枠なしで描く（見出しとスクロールの枠は、置く側が持つ）。
 * file を渡すと、そのファイルの先頭のセクションに現在地の印を付ける。
 */
export function BookToc({ slug, index, file }: { slug: string; index: BookIndex; file?: string }) {
  return (
    <div className={`${styles.frasoga} ${styles.toc}`}>
      <StructureToc
        index={index}
        file={file}
        entries="sections"
        variant="plain"
        currentValue="page"
        hrefFor={hrefForBook(slug)}
        linkComponent={ReaderLink}
        labels={{ toc: "目次", front: "冒頭" }}
      />
    </div>
  );
}
