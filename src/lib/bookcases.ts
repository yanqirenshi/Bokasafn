import { connection } from "next/server";
import { getDb } from "./db";

export type BookcasePositions = Record<string, { x: number; y: number }>;

export async function listBookcasePositions(): Promise<BookcasePositions> {
  await connection();
  const rows = getDb().prepare("SELECT key, x, y FROM bookcase_positions").all() as {
    key: string;
    x: number;
    y: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, { x: r.x, y: r.y }]));
}

export type CameraView = { x: number; y: number; w: number; h: number };

export async function getCameraView(key: string): Promise<CameraView | null> {
  await connection();
  const row = getDb()
    .prepare("SELECT x, y, w, h FROM camera_views WHERE key = ?")
    .get(key) as CameraView | undefined;
  return row ?? null;
}

export function saveCameraView(key: string, { x, y, w, h }: CameraView) {
  getDb()
    .prepare(
      `INSERT INTO camera_views (key, x, y, w, h, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET
         x = excluded.x, y = excluded.y, w = excluded.w, h = excluded.h,
         updated_at = excluded.updated_at`,
    )
    .run(key, x, y, w, h);
}

export function saveBookcasePosition(key: string, x: number, y: number) {
  getDb()
    .prepare(
      `INSERT INTO bookcase_positions (key, x, y, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET x = excluded.x, y = excluded.y, updated_at = excluded.updated_at`,
    )
    .run(key, x, y);
}
