"use client";

import { useState } from "react";
import {
  BOOKCASE_NAME_MAX_LENGTH,
  MIN_WIDTH_RANGE,
  SHELF_ROWS_RANGE,
  isValidBookcaseSettings,
  normalizeBookcaseName,
  type BookcaseSettings,
} from "@/lib/bookcase-settings";
import type { Bookcase } from "./layout";
import styles from "./Inspector.module.css";

/** 本棚の名札を選んだときに右端に出すパネル。名前・段数・最小横幅を変えられる */
export function BookcaseInspector({
  bookcase: c,
  onChange,
  onRename,
  onClose,
}: {
  bookcase: Bookcase<unknown>;
  onChange: (settings: BookcaseSettings) => void;
  onRename: (name: string) => void;
  onClose: () => void;
}) {
  // 入力途中の値（空欄など）も持てるよう、入力欄の文字列は別に持つ
  const [name, setName] = useState(c.label);
  const nameIsValid = normalizeBookcaseName(name) !== null;
  const [rows, setRows] = useState(String(c.settings.shelfRows));
  const [minWidth, setMinWidth] = useState(String(c.settings.minWidth));

  const apply = (nextRows: string, nextMinWidth: string) => {
    const next = { shelfRows: Number(nextRows), minWidth: Number(nextMinWidth) };
    if (isValidBookcaseSettings(next)) onChange(next);
  };
  const widened = c.w > c.settings.minWidth;

  return (
    <aside className={styles.inspector} aria-label={`${c.label} の本棚の設定`}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="閉じる">
        ×
      </button>

      <h2 className={styles.title}>{c.label}</h2>
      <dl className={styles.meta}>
        <dt>本の数</dt>
        <dd>{c.books.length} 冊</dd>
        <dt>横幅</dt>
        <dd>{Math.round(c.w)}</dd>
      </dl>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span>名前</span>
          <input
            type="text"
            required
            maxLength={BOOKCASE_NAME_MAX_LENGTH}
            value={name}
            aria-invalid={!nameIsValid}
            onChange={(e) => {
              setName(e.target.value);
              const next = normalizeBookcaseName(e.target.value);
              if (next) onRename(next);
            }}
          />
        </label>
        <label className={styles.field}>
          <span>段数</span>
          <input
            type="number"
            inputMode="numeric"
            min={SHELF_ROWS_RANGE.min}
            max={SHELF_ROWS_RANGE.max}
            step={1}
            value={rows}
            onChange={(e) => {
              setRows(e.target.value);
              apply(e.target.value, minWidth);
            }}
          />
        </label>
        <label className={styles.field}>
          <span>最小横幅</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_WIDTH_RANGE.min}
            max={MIN_WIDTH_RANGE.max}
            step={10}
            value={minWidth}
            onChange={(e) => {
              setMinWidth(e.target.value);
              apply(rows, e.target.value);
            }}
          />
        </label>
      </div>

      <p className={styles.note}>
        {!nameIsValid && `名前は 1〜${BOOKCASE_NAME_MAX_LENGTH} 文字で入れてください。`}
        段数は {SHELF_ROWS_RANGE.min}〜{SHELF_ROWS_RANGE.max}、最小横幅は {MIN_WIDTH_RANGE.min}〜
        {MIN_WIDTH_RANGE.max} の範囲で指定できます。
        {widened && " いまは本が入りきらないため、最小横幅より広げています。"}
      </p>
    </aside>
  );
}
