// 本棚ごとの設定の既定値と、受け付ける範囲。サーバーとクライアントの両方から使う。

export type BookcaseSettings = { shelfRows: number; minWidth: number };

export const DEFAULT_BOOKCASE_SETTINGS: BookcaseSettings = { shelfRows: 4, minWidth: 320 };

export const SHELF_ROWS_RANGE = { min: 1, max: 20 } as const;
export const MIN_WIDTH_RANGE = { min: 120, max: 5000 } as const;

/** 本棚の名前の長さの上限（名札に収まる程度） */
export const BOOKCASE_NAME_MAX_LENGTH = 20;

/** 前後の空白を除いた本棚の名前。空や長すぎる名前、制御文字を含む名前なら null */
export function normalizeBookcaseName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed || [...trimmed].length > BOOKCASE_NAME_MAX_LENGTH) return null;
  if (/\p{Cc}/u.test(trimmed)) return null;
  return trimmed;
}

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
