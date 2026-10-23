"use server";

import { saveBookcasePosition } from "@/lib/bookcases";

const KEY_PATTERN = /^[^\s:]{1,64}:\d{1,4}$/u;
const LIMIT = 1e7;

/** 本棚をドラッグで動かした先を保存する */
export async function moveBookcase(key: string, x: number, y: number) {
  if (typeof key !== "string" || !KEY_PATTERN.test(key)) throw new Error("invalid key");
  for (const v of [x, y]) {
    if (typeof v !== "number" || !Number.isFinite(v) || Math.abs(v) > LIMIT) {
      throw new Error("invalid position");
    }
  }
  saveBookcasePosition(key, Math.round(x), Math.round(y));
}
