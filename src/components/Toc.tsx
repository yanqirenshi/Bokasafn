import Link from "next/link";
import type { Section } from "@/lib/books";
import styles from "./Toc.module.css";

export function Toc({
  slug,
  sections,
  currentId,
}: {
  slug: string;
  sections: Section[];
  currentId?: number;
}) {
  return (
    <ol className={styles.toc}>
      {sections.map((s) => (
        <li
          key={s.id}
          className={s.depth === 0 ? styles.top : undefined}
          style={{ paddingInlineStart: `${s.depth * 1.2}em` }}
        >
          <Link
            href={`/books/${slug}/${s.id}`}
            className={s.id === currentId ? styles.current : undefined}
            aria-current={s.id === currentId ? "page" : undefined}
          >
            {s.title}
          </Link>
        </li>
      ))}
    </ol>
  );
}
