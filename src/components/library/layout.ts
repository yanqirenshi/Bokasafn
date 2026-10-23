// 図書館の SVG 上の配置を計算する。単位は SVG のユーザー座標。

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
/** 本が少なくても図書館らしく見えるよう、最低限並べておく本棚の数 */
const MIN_CASES = 8;

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

export type Bookcase<T> = {
  key: string;
  label: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  shelves: Shelf[];
  books: PlacedBook<T>[];
};

export type LibraryLayout<T> = {
  width: number;
  height: number;
  cases: Bookcase<T>[];
};

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

function shelvesOf(caseY: number): Shelf[] {
  const top = caseY + FRAME + PLAQUE_H;
  const inner = CASE_H - FRAME * 2 - PLAQUE_H;
  const rowH = inner / SHELF_ROWS;
  return Array.from({ length: SHELF_ROWS }, (_, i) => ({
    y: top + rowH * i,
    h: rowH - SHELF_THICKNESS,
  }));
}

export function layoutLibrary<T extends SpineInput>(books: T[]): LibraryLayout<T> {
  // 分類ごとに本棚を割り当て、棚板が埋まったら次の段、次の本棚へ送る
  type Draft = { label: string | null; rows: PlacedBook<T>[][] };
  const drafts: Draft[] = [];
  const innerW = CASE_W - FRAME * 2 - 12;

  for (const [category, group] of Map.groupBy(books, (b) => b.category)) {
    let current: Draft = { label: category, rows: [[]] };
    drafts.push(current);
    let used = 0;
    for (const book of group) {
      const size = spineSize(book);
      if (used + size.w > innerW) {
        if (current.rows.length === SHELF_ROWS) {
          current = { label: `${category}（續）`, rows: [[]] };
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
  while (drafts.length < MIN_CASES) drafts.push({ label: null, rows: [] });

  const cases = drafts.map((draft, i): Bookcase<T> => {
    const x = MARGIN + (i % COLS) * (CASE_W + GAP_X);
    const y = MARGIN + Math.floor(i / COLS) * (CASE_H + GAP_Y);
    const shelves = shelvesOf(y);
    const placed = draft.rows.flatMap((row, r) =>
      row.map((b) => ({
        ...b,
        x: x + FRAME + 8 + b.x,
        y: shelves[r].y + shelves[r].h - b.h,
      })),
    );
    return {
      key: `case-${i}`,
      label: draft.label,
      x,
      y,
      w: CASE_W,
      h: CASE_H,
      shelves,
      books: placed,
    };
  });

  const rows = Math.ceil(cases.length / COLS);
  return {
    width: MARGIN * 2 + COLS * CASE_W + (COLS - 1) * GAP_X,
    height: MARGIN * 2 + rows * CASE_H + (rows - 1) * GAP_Y,
    cases,
  };
}

export const CASE_FRAME = FRAME;
export const CASE_PLAQUE_H = PLAQUE_H;
export const CASE_SHELF_THICKNESS = SHELF_THICKNESS;
