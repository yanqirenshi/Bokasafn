import Link from "next/link";
import type { CSSProperties } from "react";
import type { ShelfBook } from "@/lib/books";
import styles from "./Inspector.module.css";

const MAX_CHAPTERS = 12;

/** 本棚で選んだ本の情報を右端に出すパネル */
export function Inspector({ book, onClose }: { book: ShelfBook; onClose: () => void }) {
  const readHref = book.firstSectionId
    ? `/books/${book.slug}/${book.firstSectionId}`
    : `/books/${book.slug}`;
  const rest = book.chapters.length - MAX_CHAPTERS;

  return (
    <aside
      className={styles.inspector}
      aria-label={`${book.title} の情報`}
      style={{ "--cover": book.spineColor } as CSSProperties}
    >
      <button type="button" className={styles.close} onClick={onClose} aria-label="閉じる">
        ×
      </button>

      <div className={styles.cover}>
        <span className={styles.coverTitle}>{book.title}</span>
      </div>

      <h2 className={styles.title}>{book.title}</h2>
      <dl className={styles.meta}>
        {book.author && (
          <>
            <dt>著者</dt>
            <dd>{book.author}</dd>
          </>
        )}
        {book.era && (
          <>
            <dt>時代</dt>
            <dd>{book.era}</dd>
          </>
        )}
        <dt>分類</dt>
        <dd>{book.category}</dd>
        <dt>分量</dt>
        <dd>
          約 {book.charCount.toLocaleString()} 字・{book.sectionCount} 篇
        </dd>
      </dl>

      {book.description && <p className={styles.description}>{book.description}</p>}

      <Link href={readHref} className={styles.read}>
        読む
      </Link>

      {book.chapters.length > 0 && (
        <section className={styles.chapters}>
          <h3>目次</h3>
          <ol>
            {book.chapters.slice(0, MAX_CHAPTERS).map((title, i) => (
              <li key={i}>{title}</li>
            ))}
          </ol>
          {rest > 0 && <p className={styles.more}>ほか {rest} 篇</p>}
          <Link href={`/books/${book.slug}`} className={styles.tocLink}>
            目次をすべて見る →
          </Link>
        </section>
      )}

      <p className={styles.source}>
        底本：
        <a href={book.sourceUrl} target="_blank" rel="noreferrer">
          {book.sourceName}
        </a>
        {book.license && `（${book.license}）`}
      </p>
    </aside>
  );
}
