"use client";

import { useTransition } from "react";
import { setProductActive } from "@/app/actions/inventory";
import styles from "./page.module.css";

export default function ProductStatusToggle({
  productId,
  isActive,
  isLowStock,
}: {
  productId: string;
  isActive: boolean;
  isLowStock: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={styles.statusCell}>
      {isActive ? (
        isLowStock ? (
          <span className={styles.lowBadge}>Low stock</span>
        ) : (
          <span className={styles.okBadge}>OK</span>
        )
      ) : (
        <span className={styles.inactive}>Inactive</span>
      )}
      <button
        type="button"
        className={styles.statusToggleButton}
        disabled={pending}
        onClick={(e) => {
          e.stopPropagation();
          startTransition(() => {
            setProductActive(productId, !isActive);
          });
        }}
      >
        {pending ? "…" : isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}
