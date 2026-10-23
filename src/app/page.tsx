import { Suspense } from "react";
import { Library } from "@/components/library/Library";
import { getCameraView, listBookcasePositions } from "@/lib/bookcases";
import { listShelfBooks } from "@/lib/books";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.loading}>本棚を準備しています…</p>}>
        <Shelves />
      </Suspense>
    </main>
  );
}

async function Shelves() {
  const [books, positions, camera] = await Promise.all([
    listShelfBooks(),
    listBookcasePositions(),
    getCameraView("library"),
  ]);
  if (books.length === 0) {
    return (
      <p className={styles.loading}>
        本棚はまだ空です。<code>npm run import</code> で本を取り込んでください。
      </p>
    );
  }
  return <Library books={books} positions={positions} camera={camera} />;
}
