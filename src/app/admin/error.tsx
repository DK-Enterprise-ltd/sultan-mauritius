"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import errorStyles from "./error.module.css";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.section}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={errorStyles.message}>
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      {error.digest && <p className={errorStyles.digest}>Error ID: {error.digest}</p>}
      <button type="button" onClick={reset} className={errorStyles.retryButton}>
        Try again
      </button>
    </div>
  );
}
