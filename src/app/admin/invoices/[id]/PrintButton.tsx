"use client";

import styles from "./page.module.css";

export default function PrintButton() {
  return (
    <button type="button" className={styles.printButton} onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
