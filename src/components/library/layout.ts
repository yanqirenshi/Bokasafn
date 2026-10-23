// 図書館の SVG 上の配置を計算する。単位は SVG のユーザー座標。
// 本棚の中身（棚板・本）の座標は本棚の左上を原点とした相対座標で持ち、
// 本棚を動かすときは本棚の x, y だけを変える。

import {
  DEFAULT_BOOKCASE_SETTINGS,
  type BookcaseSettings,
} from "@/lib/bookcase-settings";

const FRAME = 14;
const PLAQUE_H = 34;
/** 一段の高さ（棚板を含む） */
const ROW_H = 94.5;
const SHELF_THICKNESS = 8;
/** 本棚の内側で、本の左右に空ける余白の合計 */
const INNER_PADDING = 12;
/** 本と本の間 */
const SPINE_GAP = 1;
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
  /** 位置や設定を保存するときの識別子。「分類:0」 */
  key: string;
  label: string;
  settings: BookcaseSettings;
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

function shelvesOf(rows: number): Shelf[] {
  return Array.from({ length: rows }, (_, i) => ({
    y: FRAME + PLAQUE_H + ROW_H * i,
    h: ROW_H - SHELF_THICKNESS,
  }));
}

/** 本を左から詰めていき、幅 innerW に収まらなくなったら次の段へ送る */
function packRows(widths: number[], innerW: number): number[][] {
  const rows: number[][] = [[]];
  let used = 0;
  widths.forEach((w, i) => {
    if (used > 0 && used + w > innerW) {
      rows.push([]);
      used = 0;
    }
    rows.at(-1)!.push(i);
    used += w + SPINE_GAP;
  });
  return rows;
}

/**
 * 指定の段数に収まる本棚の横幅を求める。最小横幅で収まればそのまま、
 * 収まらなければ収まるまで横に広げる。
 */
function fitWidth(widths: number[], { shelfRows, minWidth }: BookcaseSettings) {
  const chrome = FRAME * 2 + INNER_PADDING;
  const total = widths.reduce((sum, w) => sum + w + SPINE_GAP, 0);
  let innerW = Math.max(minWidth - chrome, Math.max(0, ...widths), Math.ceil(total / shelfRows));
  while (packRows(widths, innerW).length > shelfRows) innerW += 4;
  return Math.max(minWidth, innerW + chrome);
}

export function layoutBookcases<T extends SpineInput>(
  books: T[],
  positions: Record<string, Point>,
  settingsMap: Record<string, BookcaseSettings>,
): Bookcase<T>[] {
  // 分類ごとに本棚を一つ用意する
  const cases = [...Map.groupBy(books, (b) => b.category)].map(([category, group]) => {
    const key = `${category}:0`;
    const settings = settingsMap[key] ?? DEFAULT_BOOKCASE_SETTINGS;
    const sizes = group.map(spineSize);
    const w = fitWidth(
      sizes.map((s) => s.w),
      settings,
    );
    const shelves = shelvesOf(settings.shelfRows);
    const placed: PlacedBook<T>[] = [];
    packRows(
      sizes.map((s) => s.w),
      w - FRAME * 2 - INNER_PADDING,
    ).forEach((row, r) => {
      let x = FRAME + INNER_PADDING / 2 + 2;
      for (const i of row) {
        const { w: bw, h: bh } = sizes[i];
        placed.push({ book: group[i], x, y: shelves[r].y + shelves[r].h - bh, w: bw, h: bh });
        x += bw + SPINE_GAP;
      }
    });
    return {
      key,
      label: category,
      settings,
      x: 0,
      y: 0,
      w,
      h: FRAME * 2 + PLAQUE_H + ROW_H * settings.shelfRows,
      shelves,
      books: placed,
    };
  });

  // 保存された位置がなければ、左上から COLS 台ずつ並べる（大きさが違っても重ならないように）
  let x = MARGIN;
  let y = MARGIN;
  let rowH = 0;
  cases.forEach((c, i) => {
    if (i > 0 && i % COLS === 0) {
      x = MARGIN;
      y += rowH + GAP_Y;
      rowH = 0;
    }
    Object.assign(c, positions[c.key] ?? { x, y });
    x += c.w + GAP_X;
    rowH = Math.max(rowH, c.h);
  });
  return cases;
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
