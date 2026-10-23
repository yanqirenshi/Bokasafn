import { Suspense } from "react";
import { Bookshelf } from "@/components/Bookshelf";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.library}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bókasafn</h1>
        <p className={styles.subtitle}>古典の図書館 — 本を選ぶと開きます</p>
      </header>
      <Suspense fallback={<p className={styles.loading}>本棚を準備しています…</p>}>
        <Bookshelf />
      </Suspense>
    </main>
  );
}
