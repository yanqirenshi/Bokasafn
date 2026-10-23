import { Suspense } from "react";
import { Library } from "@/components/library/Library";
import { listBookcasePositions } from "@/lib/bookcases";
import { listShelfBooks } from "@/lib/books";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bókasafn</h1>
        <p className={styles.subtitle}>古典の図書館 — 本棚に近づいて本を選んでください</p>
      </header>
      <Suspense fallback={<p className={styles.loading}>本棚を準備しています…</p>}>
        <Shelves />
      </Suspense>
    </main>
  );
}

async function Shelves() {
  const [books, positions] = await Promise.all([listShelfBooks(), listBookcasePositions()]);
  if (books.length === 0) {
    return (
      <p className={styles.loading}>
        本棚はまだ空です。<code>npm run import</code> で本を取り込んでください。
      </p>
    );
  }
  return <Library books={books} positions={positions} />;
}
