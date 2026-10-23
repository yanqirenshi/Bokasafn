"use server";

import { saveBookcasePosition, saveCameraView } from "@/lib/bookcases";

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

/** 本棚の画面のカメラ（視点とズーム）を保存する */
export async function saveLibraryCamera(view: { x: number; y: number; w: number; h: number }) {
  const { x, y, w, h } = view ?? {};
  // ズームに制限はないが、幅と高さは正の有限値でなければならない
  if (![x, y, w, h].every(isCoordinate) || !(w > 0) || !(h > 0)) {
    throw new Error("invalid camera");
  }
  saveCameraView("library", { x, y, w, h });
}
