"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LinkComponent, LinkTarget } from "@yanqirenshi/frasoga";

/** 巻頭（最初の見出しより前の本文）のページの ID。src/lib/books.ts の FRONT_PAGE_ID と同じ */
const FRONT_PAGE_ID = "front";

/** 同じページの中のセクションへ移るときに、本文の包みへ知らせるイベント */
export const SECTION_EVENT = "bokasafn:section";

/**
 * 目次や本文のリンクの行き先を作る。
 * ページは、分けたファイル 1 つ。ファイルの途中にあるセクションは、ページ内の位置（#id）を指す。
 */
export function hrefForBook(slug: string) {
  return ({ id, fileId }: LinkTarget): string => {
    const page = `/books/${slug}/${encodeURIComponent(fileId ?? FRONT_PAGE_ID)}`;
    return id && id !== fileId ? `${page}#${encodeURIComponent(id)}` : page;
  };
}

/**
 * Frasoga に渡すリンクの部品。next/link で描く。
 * 同じページの中へ移るリンクは、Next にスクロールさせない。
 * Frasoga が見出しを中央に合わせた後で、Next が上端に合わせ直すのを防ぐため。
 */
export const ReaderLink: LinkComponent = function ReaderLink({ href, onClick, ...rest }) {
  const pathname = usePathname();
  const [path, hash] = href.split("#");
  const samePage = path === pathname;
  return (
    <Link
      href={href}
      scroll={samePage ? false : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (samePage) {
          const id = hash ? decodeURIComponent(hash) : null;
          window.dispatchEvent(new CustomEvent(SECTION_EVENT, { detail: id }));
        }
      }}
      {...rest}
    />
  );
};
