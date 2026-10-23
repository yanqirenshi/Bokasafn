import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenBook } from "@/components/OpenBook";
import { ReaderText } from "@/components/ReaderText";
import { Toc } from "@/components/Toc";
import { getBook, getSection, listSections } from "@/lib/books";
import styles from "../../book.module.css";

type Props = PageProps<"/books/[slug]/[sectionId]">;

async function load(params: Props["params"]) {
  const { slug, sectionId } = await params;
  const book = await getBook(slug);
  const id = Number(sectionId);
  if (!book || !Number.isInteger(id)) return undefined;
  const section = await getSection(book.id, id);
  return section && { book, section };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  return { title: found && `${found.section.title} — ${found.book.title}` };
}

export default async function SectionPage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { book, section } = found;

  const sections = await listSections(book.id);
  const index = sections.findIndex((s) => s.id === section.id);
  const children = sections.filter((s) => s.parentId === section.id);
  const ancestors: typeof sections = [];
  for (let p = section.parentId; p != null; ) {
    const parent = sections.find((s) => s.id === p);
    if (!parent) break;
    ancestors.unshift(parent);
    p = parent.parentId;
  }
  // 前後への移動は本文のあるセクションだけを辿る
  const prev = sections.slice(0, index).findLast((s) => s.hasBody);
  const next = sections.slice(index + 1).find((s) => s.hasBody);

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
            <Toc slug={book.slug} sections={sections} currentId={section.id} />
          </div>
        </details>
      }
      right={
        <article>
          {ancestors.length > 0 && (
            <p className={styles.breadcrumb}>
              {ancestors.map((a) => (
                <Link key={a.id} href={`/books/${book.slug}/${a.id}`}>
                  {a.title}
                </Link>
              ))}
            </p>
          )}
          <h1 className={styles.sectionTitle}>{section.title}</h1>

          {section.body && <ReaderText body={section.body} />}

          {children.length > 0 && (
            <ul className={styles.children}>
              {children.map((c) => (
                <li key={c.id}>
                  <Link href={`/books/${book.slug}/${c.id}`}>{c.title}</Link>
                </li>
              ))}
            </ul>
          )}

          <nav className={styles.pager}>
            {prev ? (
              <Link href={`/books/${book.slug}/${prev.id}`}>← {prev.title}</Link>
            ) : (
              <span />
            )}
            {next && <Link href={`/books/${book.slug}/${next.id}`}>{next.title} →</Link>}
          </nav>
        </article>
      }
    />
  );
}
