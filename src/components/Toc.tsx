import Link from "next/link";
import { hrefOf, type TocEntry } from "@/lib/books";
import styles from "./Toc.module.css";

export function Toc({
  slug,
  entries,
  currentPageId,
}: {
  slug: string;
  entries: TocEntry[];
  /** いま開いているページ。そのページの先頭のセクションに印を付ける */
  currentPageId?: string;
}) {
  return (
    <ol className={styles.toc}>
      {entries.map((e) => {
        const current = e.isPage && e.pageId === currentPageId;
        return (
          <li
            key={e.id}
            className={e.depth === 0 ? styles.top : undefined}
            style={{ paddingInlineStart: `${e.depth * 1.2}em` }}
          >
            <Link
              href={hrefOf(slug, e)}
              className={current ? styles.current : undefined}
              aria-current={current ? "page" : undefined}
            >
              {e.title}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
