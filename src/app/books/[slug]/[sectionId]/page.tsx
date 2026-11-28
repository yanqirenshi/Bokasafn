import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenBook } from "@/components/OpenBook";
import { BookReader } from "@/components/reader/BookReader";
import { BookToc } from "@/components/reader/BookToc";
import { getBook, getContents, getPage, getReaderIndex, hrefOf } from "@/lib/books";
import { toReaderPart } from "@/lib/reader";
import styles from "../../book.module.css";

type Props = PageProps<"/books/[slug]/[sectionId]">;

// 本文の 1 ページは、本のフォルダの分けたファイル 1 つ。
// sectionId は、そのファイルの先頭のセクションの ID（s3 など。最初の見出しより前の本文は front）。
async function load(params: Props["params"]) {
  const { slug, sectionId } = await params;
  const book = await getBook(slug);
  if (!book) return undefined;
  const pageId = decodeURIComponent(sectionId);
  const [contents, index, part] = await Promise.all([
    getContents(book),
    getReaderIndex(book),
    getPage(book, pageId),
  ]);
  if (!contents || !index || !part) return undefined;
  const entry = contents.toc.find((e) => e.isPage && e.pageId === pageId);
  return { book, contents, index, part, pageId, title: entry?.title ?? pageId };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  return { title: found && `${found.title} — ${found.book.title}` };
}

export default async function SectionPage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { book, contents, index, part, pageId } = found;

  const entryOf = (id: string) => contents.toc.find((e) => e.id === id);
  const titleOfPage = (id: string) =>
    contents.toc.find((e) => e.isPage && e.pageId === id)?.title ?? id;
  const hrefOfPage = (id: string) => `/books/${book.slug}/${encodeURIComponent(id)}`;
  const at = contents.pageIds.indexOf(pageId);
  const prev = at > 0 ? contents.pageIds[at - 1] : undefined;
  const next = at >= 0 ? contents.pageIds[at + 1] : undefined;

  return (
    <OpenBook
      color={book.spineColor}
      left={
        <details className={styles.tocDetails} open>
          <summary className={styles.tocSummary}>
            {/* ページの題（h1）は書名。章の見出しは、本文の中に Frasoga が h2 で出す */}
            <h1 className={styles.tocBookTitle}>
              <Link href={`/books/${book.slug}`}>{book.title}</Link>
            </h1>
          </summary>
          <div className={styles.tocScroll}>
            <BookToc slug={book.slug} index={index} file={part.file} />
          </div>
        </details>
      }
      right={
        <article>
          {part.ancestors.length > 0 && (
            <p className={styles.breadcrumb}>
              {part.ancestors.map((a) => {
                const entry = entryOf(a.id);
                return entry ? (
                  <Link key={a.id} href={hrefOf(book.slug, entry)}>
                    {a.title}
                  </Link>
                ) : (
                  <span key={a.id}>{a.title}</span>
                );
              })}
            </p>
          )}

          <BookReader
            slug={book.slug}
            part={toReaderPart(part)}
            prevHref={prev && hrefOfPage(prev)}
            nextHref={next && hrefOfPage(next)}
          />

          <nav className={styles.pager}>
            {prev ? <Link href={hrefOfPage(prev)}>← {titleOfPage(prev)}</Link> : <span />}
            {next && <Link href={hrefOfPage(next)}>{titleOfPage(next)} →</Link>}
          </nav>
        </article>
      }
    />
  );
}
