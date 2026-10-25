"use server";

import {
  isValidBookcaseSettings,
  normalizeBookcaseName,
  type BookcaseSettings,
} from "@/lib/bookcase-settings";
import {
  saveBookcaseName,
  saveBookcasePosition,
  saveBookcaseSettings,
  saveCameraView,
} from "@/lib/bookcases";

const KEY_PATTERN = /^[^\s:]{1,64}:\d{1,4}$/u;
// ズームに制限がないので、座標の範囲は広めにとる（NaN や Infinity だけを弾くのが目的）
const LIMIT = 1e12;

function isCoordinate(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= LIMIT;
}

/** 本棚をドラッグで動かした先を保存する */
export async function moveBookcase(key: string, x: number, y: number) {
  if (typeof key !== "string" || !KEY_PATTERN.test(key)) throw new Error("invalid key");
  if (!isCoordinate(x) || !isCoordinate(y)) throw new Error("invalid position");
  saveBookcasePosition(key, Math.round(x), Math.round(y));
}

/** 本棚ごとの設定（段数と最小横幅）を保存する */
export async function updateBookcaseSettings(key: string, settings: BookcaseSettings) {
  if (typeof key !== "string" || !KEY_PATTERN.test(key)) throw new Error("invalid key");
  if (!isValidBookcaseSettings(settings)) throw new Error("invalid settings");
  saveBookcaseSettings(key, {
    shelfRows: settings.shelfRows,
    minWidth: Math.round(settings.minWidth),
  });
}

/** 本棚の名前（名札に出す名前）を変える */
export async function renameBookcase(key: string, name: string) {
  if (typeof key !== "string" || !KEY_PATTERN.test(key)) throw new Error("invalid key");
  const normalized = normalizeBookcaseName(name);
  if (!normalized) throw new Error("invalid name");
  saveBookcaseName(key, normalized);
}

/** 本棚の画面のカメラ（視点とズーム）を保存する */
export async function saveLibraryCamera(view: { x: number; y: number; w: number; h: number }) {
  const { x, y, w, h } = view ?? {};
  // ズームに制限はないが、幅と高さは正の有限値でなければならない
  if (![x, y, w, h].every(isCoordinate) || !(w > 0) || !(h > 0)) {
    throw new Error("invalid camera");
  }
  saveCameraView("library", { x, y, w, h });
}
