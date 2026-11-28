import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenBook } from "@/components/OpenBook";
import { BookToc } from "@/components/reader/BookToc";
import { formatAuthors } from "@/lib/authors";
import { getBook, getContents, getReaderIndex } from "@/lib/books";
import styles from "../book.module.css";

export async function generateMetadata({ params }: PageProps<"/books/[slug]">): Promise<Metadata> {
  const book = await getBook((await params).slug);
  return { title: book?.title };
}

export default async function BookPage({ params }: PageProps<"/books/[slug]">) {
  const book = await getBook((await params).slug);
  if (!book) notFound();
  const [contents, index] = await Promise.all([getContents(book), getReaderIndex(book)]);
  const first = contents?.pageIds[0];

  return (
    <OpenBook
      color={book.spineColor}
      left={
        <div className={styles.titlePage}>
          <h1 className={styles.bookTitle}>{book.title}</h1>
          <dl className={styles.meta}>
            {book.authors.length > 0 && (
              <>
                <dt>著者</dt>
                <dd>{formatAuthors(book.authors)}</dd>
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
            {contents && (
              <>
                <dt>字数</dt>
                <dd>約 {book.charCount.toLocaleString()} 字</dd>
              </>
            )}
          </dl>
          {book.description && <p className={styles.description}>{book.description}</p>}
          {first && (
            <Link
              href={`/books/${book.slug}/${encodeURIComponent(first)}`}
              className={styles.startButton}
            >
              読み始める
            </Link>
          )}
          {(book.sourceName || book.sourceUrl) && (
            <p className={styles.source}>
              底本：
              {book.sourceUrl ? (
                <a href={book.sourceUrl} target="_blank" rel="noreferrer">
                  {book.sourceName}「{book.title}」
                </a>
              ) : (
                <>
                  {book.sourceName}「{book.title}」
                </>
              )}
              {book.license && `（${book.license}）`}
            </p>
          )}
        </div>
      }
      right={
        <>
          <h2 className={styles.pageHeading}>目次</h2>
          {index ? (
            <BookToc slug={book.slug} index={index} />
          ) : (
            <p className={styles.description}>
              本のフォルダが見つかりません（{book.folder}
              {book.edition && `、版 ${book.edition}`}）。
            </p>
          )}
        </>
      }
    />
  );
}
