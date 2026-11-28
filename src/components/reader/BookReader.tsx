"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { lineIndexOf, StructurePart, type Part, type WritingMode } from "@yanqirenshi/frasoga";
import "@yanqirenshi/frasoga/style.css";
import { hrefForBook, ReaderLink, SECTION_EVENT } from "./links";
import styles from "./reader.module.css";

const STORAGE_KEY = "bokasafn:writing";

// 文字の向きはブラウザ (localStorage) に記憶し、開いているすべての本文で共有する
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readWriting(): WritingMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "vertical" ? "vertical" : "horizontal";
  } catch {
    return "horizontal";
  }
}

function saveWriting(w: WritingMode) {
  try {
    localStorage.setItem(STORAGE_KEY, w);
  } catch {}
  listeners.forEach((l) => l());
}

/** 図の画像の URL。src は本のフォルダからの相対パスで、figures/ の下だけを出す */
function figureUrl(slug: string, src: string): string {
  const prefix = "figures/";
  if (!src.startsWith(prefix)) return "";
  const rest = src.slice(prefix.length).split("/").map(encodeURIComponent).join("/");
  return `/books/${slug}/figures/${rest}`;
}

/**
 * 本文の 1 ページ。Frasoga の表示コンポーネントで、一文ずつ読み進める。
 * 横書き・縦書きを切り替えられる。最後の文の次は次のページへ、最初の文の前は前のページへ移る。
 */
export function BookReader({
  slug,
  part,
  prevHref,
  nextHref,
}: {
  slug: string;
  part: Part;
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const writing = useSyncExternalStore(subscribe, readWriting, () => "horizontal" as WritingMode);
  // 強調中の文の位置。#セクションID で開いたときは、そのセクションの見出しに合わせる
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const toSection = (id: string | null) =>
      setCurrent(id ? Math.max(lineIndexOf(part, id), 0) : 0);
    const fromHash = () => toSection(decodeURIComponent(location.hash.slice(1)) || null);
    const fromEvent = (event: Event) => toSection((event as CustomEvent<string | null>).detail);

    // 開いた直後は、URL の #セクションID に合わせる（無ければ先頭のまま）
    // requestAnimationFrame は、タブが隠れていると動かないので、タイマーで行う
    const timer = location.hash ? window.setTimeout(fromHash, 0) : 0;
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("popstate", fromHash);
    window.addEventListener(SECTION_EVENT, fromEvent);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("popstate", fromHash);
      window.removeEventListener(SECTION_EVENT, fromEvent);
    };
  }, [part]);

  return (
    <>
      <div className={styles.switch} role="group" aria-label="文字の向き">
        <button
          type="button"
          aria-pressed={writing === "horizontal"}
          onClick={() => saveWriting("horizontal")}
        >
          横書き
        </button>
        <button
          type="button"
          aria-pressed={writing === "vertical"}
          onClick={() => saveWriting("vertical")}
        >
          縦書き
        </button>
      </div>
      <div className={`${styles.frasoga} ${writing === "vertical" ? styles.vertical : styles.horizontal}`}>
        <StructurePart
          part={part}
          bar={false}
          writingMode={writing}
          current={current}
          onCurrentChange={setCurrent}
          figureSrc={(src) => figureUrl(slug, src)}
          hrefFor={hrefForBook(slug)}
          linkComponent={ReaderLink}
          onPastEnd={() => nextHref && router.push(nextHref)}
          onPastStart={() => prevHref && router.push(prevHref)}
        />
      </div>
    </>
  );
}
