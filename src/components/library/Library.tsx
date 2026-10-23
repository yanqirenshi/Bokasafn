"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ShelfBook } from "@/lib/books";
import { Inspector } from "./Inspector";
import {
  CASE_FRAME,
  CASE_PLAQUE_H,
  CASE_SHELF_THICKNESS,
  layoutLibrary,
  type Bookcase,
  type PlacedBook,
} from "./layout";
import { useZoomPan, type ViewBox } from "./useZoomPan";
import styles from "./Library.module.css";

const CASE_PADDING = 36;

function caseView(c: Bookcase<ShelfBook>): ViewBox {
  return {
    x: c.x - CASE_PADDING,
    y: c.y - CASE_PADDING,
    w: c.w + CASE_PADDING * 2,
    h: c.h + CASE_PADDING * 2,
  };
}

export function Library({ books }: { books: ShelfBook[] }) {
  const layout = useMemo(() => layoutLibrary(books), [books]);
  const home = useMemo(
    () => ({ x: 0, y: 0, w: layout.width, h: layout.height }),
    [layout],
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const { viewBox, zoomAt, animateTo, wasDragged, handlers } = useZoomPan(svgRef, home);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = books.find((b) => b.id === selectedId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectBook = (c: Bookcase<ShelfBook>, book: ShelfBook) => {
    setSelectedId(book.id);
    // 遠くから選んだときは、その本棚まで寄る
    if (viewBox.w > c.w * 2.5) animateTo(caseView(c));
  };

  return (
    <div className={styles.library}>
      <div className={styles.stage}>
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="本棚"
          {...handlers}
        >
          <defs>
            <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#9a6a3e" />
              <stop offset="1" stopColor="#6a4224" />
            </linearGradient>
            <linearGradient id="plank" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#b98450" />
              <stop offset="1" stopColor="#6e4526" />
            </linearGradient>
            <linearGradient id="spineShade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0.35" />
              <stop offset="0.25" stopColor="#000" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.14" />
              <stop offset="0.75" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          <rect
            className={styles.floor}
            x={-layout.width}
            y={-layout.height}
            width={layout.width * 3}
            height={layout.height * 3}
          />

          {layout.cases.map((c) => (
            <BookcaseView
              key={c.key}
              bookcase={c}
              selectedId={selectedId}
              onZoom={() => !wasDragged() && animateTo(caseView(c))}
              onSelect={(book) => !wasDragged() && selectBook(c, book)}
            />
          ))}
        </svg>

        <div className={styles.controls}>
          <button type="button" onClick={() => zoomAt(0.7)} aria-label="拡大">
            ＋
          </button>
          <button type="button" onClick={() => zoomAt(1 / 0.7)} aria-label="縮小">
            −
          </button>
          <button type="button" onClick={() => animateTo(home)}>
            全体
          </button>
        </div>
        <p className={styles.hint}>
          ホイールやピンチで拡大、ドラッグで移動。本棚をクリックすると近づきます。
        </p>
      </div>

      {selected && <Inspector book={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function BookcaseView({
  bookcase: c,
  selectedId,
  onZoom,
  onSelect,
}: {
  bookcase: Bookcase<ShelfBook>;
  selectedId: number | null;
  onZoom: () => void;
  onSelect: (book: ShelfBook) => void;
}) {
  const inner = { x: c.x + CASE_FRAME, y: c.y + CASE_FRAME, w: c.w - CASE_FRAME * 2 };
  return (
    <g className={styles.bookcase} onClick={onZoom}>
      <rect x={c.x + 8} y={c.y + 10} width={c.w} height={c.h} className={styles.caseShadow} />
      <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={4} fill="url(#wood)" />
      <rect
        x={inner.x}
        y={inner.y + CASE_PLAQUE_H}
        width={inner.w}
        height={c.h - CASE_FRAME * 2 - CASE_PLAQUE_H}
        className={styles.caseBack}
      />
      <rect
        x={c.x + c.w / 2 - 60}
        y={inner.y + 4}
        width={120}
        height={CASE_PLAQUE_H - 10}
        rx={3}
        className={c.label ? styles.plaque : styles.plaqueEmpty}
      />
      {c.label && (
        <text
          x={c.x + c.w / 2}
          y={inner.y + 4 + (CASE_PLAQUE_H - 10) / 2}
          className={styles.plaqueText}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {c.label}
        </text>
      )}
      {c.shelves.map((s, i) => (
        <rect
          key={i}
          x={inner.x}
          y={s.y + s.h}
          width={inner.w}
          height={CASE_SHELF_THICKNESS}
          fill="url(#plank)"
        />
      ))}
      {c.books.map((placed) => (
        <SpineView
          key={placed.book.id}
          placed={placed}
          selected={placed.book.id === selectedId}
          onSelect={() => onSelect(placed.book)}
        />
      ))}
    </g>
  );
}

function SpineView({
  placed: { book, x, y, w, h },
  selected,
  onSelect,
}: {
  placed: PlacedBook<ShelfBook>;
  selected: boolean;
  onSelect: () => void;
}) {
  const label = { x: x + 2.5, y: y + 9, w: w - 5, h: h - 22 };
  const chars = [...book.title].length;
  const fontSize = Math.min(9, label.w * 0.82, (label.h - 4) / chars);

  return (
    <g
      className={styles.book}
      data-selected={selected || undefined}
      role="button"
      tabIndex={0}
      aria-label={`${book.title}${book.author ? `（${book.author}）` : ""}`}
      aria-pressed={selected}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <title>{book.title}</title>
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill={book.spineColor} />
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill="url(#spineShade)" />
      <line x1={x} x2={x + w} y1={y + 4} y2={y + 4} className={styles.band} />
      <line x1={x} x2={x + w} y1={y + h - 5} y2={y + h - 5} className={styles.band} />
      <rect x={label.x} y={label.y} width={label.w} height={label.h} className={styles.label} />
      <text
        x={x + w / 2}
        y={label.y + label.h / 2}
        fontSize={fontSize}
        className={styles.spineText}
        textAnchor="middle"
      >
        {book.title}
      </text>
      <rect x={x - 1.5} y={y - 1.5} width={w + 3} height={h + 3} rx={2} className={styles.focusRing} />
    </g>
  );
}
