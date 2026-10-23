// 本棚ごとの設定の既定値と、受け付ける範囲。サーバーとクライアントの両方から使う。

export type BookcaseSettings = { shelfRows: number; minWidth: number };

export const DEFAULT_BOOKCASE_SETTINGS: BookcaseSettings = { shelfRows: 4, minWidth: 320 };

export const SHELF_ROWS_RANGE = { min: 1, max: 20 } as const;
export const MIN_WIDTH_RANGE = { min: 120, max: 5000 } as const;

export function isValidBookcaseSettings(s: unknown): s is BookcaseSettings {
  const { shelfRows, minWidth } = (s ?? {}) as Partial<BookcaseSettings>;
  return (
    Number.isInteger(shelfRows) &&
    shelfRows! >= SHELF_ROWS_RANGE.min &&
    shelfRows! <= SHELF_ROWS_RANGE.max &&
    typeof minWidth === "number" &&
    minWidth >= MIN_WIDTH_RANGE.min &&
    minWidth <= MIN_WIDTH_RANGE.max
  );
}
