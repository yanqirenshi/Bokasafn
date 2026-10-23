"use client";

import { useSyncExternalStore } from "react";
import styles from "./ReaderText.module.css";

type Writing = "horizontal" | "vertical";
const STORAGE_KEY = "bokasafn:writing";

// 文字の向きはブラウザ (localStorage) に記憶し、開いているすべての本文で共有する
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readWriting(): Writing {
  try {
    return localStorage.getItem(STORAGE_KEY) === "vertical" ? "vertical" : "horizontal";
  } catch {
    return "horizontal";
  }
}

function saveWriting(w: Writing) {
  try {
    localStorage.setItem(STORAGE_KEY, w);
  } catch {}
  listeners.forEach((l) => l());
}

/** 本文。横書き・縦書きを切り替えられる */
export function ReaderText({ body }: { body: string }) {
  const writing = useSyncExternalStore(subscribe, readWriting, () => "horizontal");

  return (
    <>
      <div className={styles.switch} role="group" aria-label="文字の向き">
        <button
          type="button"
          aria-pressed={writing === "horizontal"}
          onClick={() => saveWriting("horizontal")}
        >
          横書き
        </button>
        <button
          type="button"
          aria-pressed={writing === "vertical"}
          onClick={() => saveWriting("vertical")}
        >
          縦書き
        </button>
      </div>
      <div className={writing === "vertical" ? styles.vertical : styles.horizontal}>
        {body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </>
  );
}
