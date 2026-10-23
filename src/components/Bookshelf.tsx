import Link from "next/link";
import type { CSSProperties } from "react";
import { listBooks, type Book } from "@/lib/books";
import styles from "./Bookshelf.module.css";

/** 書名から決まる、本ごとに少しずつ違う背の高さ (px) */
function spineHeight(book: Book) {
  let hash = 0;
  for (const ch of book.slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 230 + (hash % 50);
}

/** 文字数が多い本ほど厚くする (px) */
function spineWidth(book: Book) {
  const scale = Math.log10(Math.max(book.charCount, 1000)) - 3; // 千字で 0、十万字で 2
  return Math.round(46 + Math.min(scale, 2.5) * 16);
}

export async function Bookshelf() {
  const books = await listBooks();

  if (books.length === 0) {
    return (
      <p className={styles.empty}>
        本棚はまだ空です。<code>npm run import</code> で本を取り込んでください。
      </p>
    );
  }

  const byCategory = Map.groupBy(books, (b) => b.category);

  return (
    <div className={styles.bookcase}>
      {[...byCategory].map(([category, shelfBooks]) => (
        <section key={category} className={styles.shelf} aria-label={category}>
          <h2 className={styles.label}>{category}</h2>
          <ul className={styles.row}>
            {shelfBooks.map((book) => (
              <li key={book.id}>
                <Link
                  href={`/books/${book.slug}`}
                  className={styles.spine}
                  style={
                    {
                      "--spine": book.spineColor,
                      height: spineHeight(book),
                      width: spineWidth(book),
                    } as CSSProperties
                  }
                  title={[book.title, book.author, book.era].filter(Boolean).join(" ・ ")}
                >
                  <span className={styles.band} />
                  <span className={styles.spineTitle}>{book.title}</span>
                  {book.author && <span className={styles.spineAuthor}>{book.author}</span>}
                  <span className={styles.band} />
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.plank} />
        </section>
      ))}
    </div>
  );
}
