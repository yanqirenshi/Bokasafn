"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { moveBookcase } from "@/app/actions";
import type { BookcasePositions } from "@/lib/bookcases";
import type { ShelfBook } from "@/lib/books";
import { Inspector } from "./Inspector";
import {
  CASE_FRAME,
  CASE_PLAQUE_H,
  CASE_SHELF_THICKNESS,
  boundsOf,
  layoutBookcases,
  type Bookcase,
  type PlacedBook,
  type Point,
} from "./layout";
import { useZoomPan, type ViewBox } from "./useZoomPan";
import styles from "./Library.module.css";

const CASE_PADDING = 36;
const DRAG_THRESHOLD_PX = 5;

function caseView(c: Bookcase<ShelfBook>): ViewBox {
  return {
    x: c.x - CASE_PADDING,
    y: c.y - CASE_PADDING,
    w: c.w + CASE_PADDING * 2,
    h: c.h + CASE_PADDING * 2,
  };
}

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

type CaseDrag = {
  key: string;
  pointerId: number;
  startClient: Point;
  startSvg: Point;
  origin: Point;
  moved: boolean;
};

export function Library({
  books,
  positions: savedPositions,
}: {
  books: ShelfBook[];
  positions: BookcasePositions;
}) {
  const [positions, setPositions] = useState(savedPositions);
  const cases = useMemo(() => layoutBookcases(books, positions), [books, positions]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [initialView] = useState(() => boundsOf(cases));
  const { viewBox, zoomAt, animateTo, wasDragged, panLockRef, handlers } = useZoomPan(
    svgRef,
    initialView,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = books.find((b) => b.id === selectedId);

  // 本棚のドラッグ。動かした直後のクリック（本棚へ寄る・本を選ぶ）は無視する
  const caseDrag = useRef<CaseDrag | null>(null);
  const caseMoved = useRef(false);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const suppressClick = () => wasDragged() || caseMoved.current;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setPosition = (key: string, p: Point) =>
    setPositions((prev) => ({ ...prev, [key]: p }));

  const cancelCaseDrag = () => {
    const drag = caseDrag.current;
    if (drag?.moved) setPosition(drag.key, drag.origin);
    caseDrag.current = null;
    panLockRef.current = false;
    setDraggingKey(null);
  };

  const onCasePointerDown = (c: Bookcase<ShelfBook>, e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg || e.button !== 0 || caseDrag.current) return;
    caseDrag.current = {
      key: c.key,
      pointerId: e.pointerId,
      startClient: { x: e.clientX, y: e.clientY },
      startSvg: toSvgPoint(svg, e.clientX, e.clientY),
      origin: { x: c.x, y: c.y },
      moved: false,
    };
    panLockRef.current = true;
  };

  const svgHandlers = {
    ...handlers,
    onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => {
      caseMoved.current = false;
      // 2 本目の指が触れたらピンチ操作を優先し、本棚の移動はやめる
      if (caseDrag.current && caseDrag.current.pointerId !== e.pointerId) cancelCaseDrag();
      handlers.onPointerDown(e);
    },
    onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => {
      handlers.onPointerMove(e);
      const drag = caseDrag.current;
      const svg = svgRef.current;
      if (!drag || !svg || drag.pointerId !== e.pointerId) return;
      if (!drag.moved) {
        const distance = Math.hypot(
          e.clientX - drag.startClient.x,
          e.clientY - drag.startClient.y,
        );
        if (distance < DRAG_THRESHOLD_PX) return;
        drag.moved = true;
        svg.setPointerCapture(e.pointerId);
        setDraggingKey(drag.key);
      }
      const p = toSvgPoint(svg, e.clientX, e.clientY);
      setPosition(drag.key, {
        x: drag.origin.x + p.x - drag.startSvg.x,
        y: drag.origin.y + p.y - drag.startSvg.y,
      });
    },
    onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => {
      handlers.onPointerUp(e);
      const drag = caseDrag.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      caseDrag.current = null;
      panLockRef.current = false;
      setDraggingKey(null);
      if (!drag.moved) return;
      caseMoved.current = true;
      const svg = svgRef.current;
      const p = svg ? toSvgPoint(svg, e.clientX, e.clientY) : drag.startSvg;
      const to = {
        x: Math.round(drag.origin.x + p.x - drag.startSvg.x),
        y: Math.round(drag.origin.y + p.y - drag.startSvg.y),
      };
      setPosition(drag.key, to);
      moveBookcase(drag.key, to.x, to.y).catch((err) => {
        console.error("本棚の位置を保存できませんでした", err);
        setPosition(drag.key, drag.origin);
      });
    },
    onPointerCancel: (e: React.PointerEvent<SVGSVGElement>) => {
      handlers.onPointerCancel(e);
      if (caseDrag.current?.pointerId === e.pointerId) cancelCaseDrag();
    },
  };

  // 動かしている本棚を最前面に描く
  const ordered = draggingKey
    ? [...cases.filter((c) => c.key !== draggingKey), ...cases.filter((c) => c.key === draggingKey)]
    : cases;

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
          {...svgHandlers}
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

          {/* ズームに制限がないので、床はどこまで引いても切れないよう十分に広くとる */}
          <rect className={styles.floor} x={-1e7} y={-1e7} width={2e7} height={2e7} />

          {ordered.map((c) => (
            <BookcaseView
              key={c.key}
              bookcase={c}
              dragging={c.key === draggingKey}
              selectedId={selectedId}
              onPointerDown={(e) => onCasePointerDown(c, e)}
              onZoom={() => !suppressClick() && animateTo(caseView(c))}
              onSelect={(book) => !suppressClick() && setSelectedId(book.id)}
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
          <button type="button" onClick={() => animateTo(boundsOf(cases))}>
            全体
          </button>
        </div>
      </div>

      {selected && <Inspector book={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function BookcaseView({
  bookcase: c,
  dragging,
  selectedId,
  onPointerDown,
  onZoom,
  onSelect,
}: {
  bookcase: Bookcase<ShelfBook>;
  dragging: boolean;
  selectedId: number | null;
  onPointerDown: (e: React.PointerEvent) => void;
  onZoom: () => void;
  onSelect: (book: ShelfBook) => void;
}) {
  const innerW = c.w - CASE_FRAME * 2;
  return (
    <g
      className={styles.bookcase}
      data-dragging={dragging || undefined}
      transform={`translate(${c.x} ${c.y})`}
      onPointerDown={onPointerDown}
      onClick={onZoom}
    >
      <rect x={8} y={10} width={c.w} height={c.h} className={styles.caseShadow} />
      <rect width={c.w} height={c.h} rx={4} fill="url(#wood)" />
      <rect
        x={CASE_FRAME}
        y={CASE_FRAME + CASE_PLAQUE_H}
        width={innerW}
        height={c.h - CASE_FRAME * 2 - CASE_PLAQUE_H}
        className={styles.caseBack}
      />
      <rect
        x={c.w / 2 - 60}
        y={CASE_FRAME + 4}
        width={120}
        height={CASE_PLAQUE_H - 10}
        rx={3}
        className={styles.plaque}
      />
      <text
        x={c.w / 2}
        y={CASE_FRAME + 4 + (CASE_PLAQUE_H - 10) / 2}
        className={styles.plaqueText}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {c.label}
      </text>
      {c.shelves.map((s, i) => (
        <rect
          key={i}
          x={CASE_FRAME}
          y={s.y + s.h}
          width={innerW}
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
