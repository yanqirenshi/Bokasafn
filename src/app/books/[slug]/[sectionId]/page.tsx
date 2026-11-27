import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenBook } from "@/components/OpenBook";
import { ReaderText } from "@/components/ReaderText";
import { StructureBody } from "@/components/StructureBody";
import { Toc } from "@/components/Toc";
import { getBook, getContents, getPage, hrefOf } from "@/lib/books";
import styles from "../../book.module.css";

type Props = PageProps<"/books/[slug]/[sectionId]">;

// 本文の 1 ページは、本のフォルダの分けたファイル 1 つ。
// sectionId は、そのファイルの先頭のセクションの ID（s3 など。最初の見出しより前の本文は front）。
async function load(params: Props["params"]) {
  const { slug, sectionId } = await params;
  const book = await getBook(slug);
  if (!book) return undefined;
  const pageId = decodeURIComponent(sectionId);
  const [contents, part] = await Promise.all([getContents(book), getPage(book, pageId)]);
  if (!contents || !part) return undefined;
  const entry = contents.toc.find((e) => e.isPage && e.pageId === pageId);
  return { book, contents, part, pageId, title: entry?.title ?? pageId };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  return { title: found && `${found.title} — ${found.book.title}` };
}

export default async function SectionPage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { book, contents, part, pageId, title } = found;

  const entryOf = (id: string) => contents.toc.find((e) => e.id === id);
  const titleOfPage = (id: string) =>
    contents.toc.find((e) => e.isPage && e.pageId === id)?.title ?? id;
  const index = contents.pageIds.indexOf(pageId);
  const prev = index > 0 ? contents.pageIds[index - 1] : undefined;
  const next = index >= 0 ? contents.pageIds[index + 1] : undefined;

  // ページの先頭のセクションの見出しは、ページの題として出す。中身だけを本文に渡す
  const head = part.body[0];
  const nodes = part.id !== null && head?.type === "section" ? head.children : part.body;

  return (
    <OpenBook
      color={book.spineColor}
      left={
        <details className={styles.tocDetails} open>
          <summary className={styles.tocSummary}>
            <Link href={`/books/${book.slug}`} className={styles.tocBookTitle}>
              {book.title}
            </Link>
          </summary>
          <div className={styles.tocScroll}>
            <Toc slug={book.slug} entries={contents.toc} currentPageId={pageId} />
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
          <h1 className={styles.sectionTitle}>{title}</h1>

          <ReaderText>
            <StructureBody slug={book.slug} nodes={nodes} />
          </ReaderText>

          <nav className={styles.pager}>
            {prev ? (
              <Link href={`/books/${book.slug}/${encodeURIComponent(prev)}`}>
                ← {titleOfPage(prev)}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/books/${book.slug}/${encodeURIComponent(next)}`}>
                {titleOfPage(next)} →
              </Link>
            )}
          </nav>
        </article>
      }
    />
  );
}
