import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import styles from "./OpenBook.module.css";

/** 見開きの本。左右のページを受け取って並べる */
export function OpenBook({
  color,
  left,
  right,
}: {
  color: string;
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className={styles.desk}>
      <nav className={styles.back}>
        <Link href="/">← 本棚に戻る</Link>
      </nav>
      <div className={styles.book} style={{ "--cover": color } as CSSProperties}>
        <div className={`${styles.page} ${styles.left}`}>{left}</div>
        <div className={`${styles.page} ${styles.right}`}>{right}</div>
      </div>
    </div>
  );
}
