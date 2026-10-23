// 図書館の SVG 上の配置を計算する。単位は SVG のユーザー座標。
// 本棚の中身（棚板・本）の座標は本棚の左上を原点とした相対座標で持ち、
// 本棚を動かすときは本棚の x, y だけを変える。

export const CASE_W = 320;
export const CASE_H = 440;
const FRAME = 14;
const PLAQUE_H = 34;
const SHELF_ROWS = 4;
const SHELF_THICKNESS = 8;
const COLS = 4;
const GAP_X = 70;
const GAP_Y = 90;
const MARGIN = 80;

export type SpineInput = {
  id: number;
  slug: string;
  title: string;
  category: string;
  charCount: number;
};

export type PlacedBook<T> = {
  book: T;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Shelf = { y: number; h: number };

export type Point = { x: number; y: number };

export type Bookcase<T> = {
  /** 位置を保存するときの識別子。「分類:その分類の何台目か」 */
  key: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shelves: Shelf[];
  books: PlacedBook<T>[];
};

export type Bounds = { x: number; y: number; w: number; h: number };

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** 字数が多い本ほど厚く (14〜30)、背の高さは書名で少しずつ変える (60〜80) */
function spineSize(book: SpineInput) {
  const scale = Math.min(Math.max(Math.log10(Math.max(book.charCount, 1)) - 3, 0), 2.5);
  return { w: Math.round(14 + scale * 6.4), h: 60 + (hash(book.slug) % 21) };
}

const SHELVES: Shelf[] = (() => {
  const top = FRAME + PLAQUE_H;
  const rowH = (CASE_H - FRAME * 2 - PLAQUE_H) / SHELF_ROWS;
  return Array.from({ length: SHELF_ROWS }, (_, i) => ({
    y: top + rowH * i,
    h: rowH - SHELF_THICKNESS,
  }));
})();

/** 既定の並び（格子状）での i 台目の位置 */
function gridPosition(i: number): Point {
  return {
    x: MARGIN + (i % COLS) * (CASE_W + GAP_X),
    y: MARGIN + Math.floor(i / COLS) * (CASE_H + GAP_Y),
  };
}

export function layoutBookcases<T extends SpineInput>(
  books: T[],
  positions: Record<string, Point>,
): Bookcase<T>[] {
  // 分類ごとに本棚を割り当て、棚板が埋まったら次の段、次の本棚へ送る
  type Draft = { key: string; label: string; rows: PlacedBook<T>[][] };
  const drafts: Draft[] = [];
  const innerW = CASE_W - FRAME * 2 - 12;

  for (const [category, group] of Map.groupBy(books, (b) => b.category)) {
    let n = 0;
    let current: Draft = { key: `${category}:${n}`, label: category, rows: [[]] };
    drafts.push(current);
    let used = 0;
    for (const book of group) {
      const size = spineSize(book);
      if (used + size.w > innerW) {
        if (current.rows.length === SHELF_ROWS) {
          n++;
          current = { key: `${category}:${n}`, label: `${category}（續）`, rows: [[]] };
          drafts.push(current);
        } else {
          current.rows.push([]);
        }
        used = 0;
      }
      current.rows.at(-1)!.push({ book, x: used, y: 0, ...size });
      used += size.w + 1;
    }
  }

  return drafts.map((draft, i) => ({
    key: draft.key,
    label: draft.label,
    ...(positions[draft.key] ?? gridPosition(i)),
    w: CASE_W,
    h: CASE_H,
    shelves: SHELVES,
    books: draft.rows.flatMap((row, r) =>
      row.map((b) => ({
        ...b,
        x: FRAME + 8 + b.x,
        y: SHELVES[r].y + SHELVES[r].h - b.h,
      })),
    ),
  }));
}

/** すべての本棚が収まる範囲（余白込み） */
export function boundsOf(cases: { x: number; y: number; w: number; h: number }[]): Bounds {
  const minX = Math.min(...cases.map((c) => c.x));
  const minY = Math.min(...cases.map((c) => c.y));
  const maxX = Math.max(...cases.map((c) => c.x + c.w));
  const maxY = Math.max(...cases.map((c) => c.y + c.h));
  return {
    x: minX - MARGIN,
    y: minY - MARGIN,
    w: maxX - minX + MARGIN * 2,
    h: maxY - minY + MARGIN * 2,
  };
}

export const CASE_FRAME = FRAME;
export const CASE_PLAQUE_H = PLAQUE_H;
export const CASE_SHELF_THICKNESS = SHELF_THICKNESS;
