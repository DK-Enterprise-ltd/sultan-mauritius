"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions/inventory";
import styles from "./page.module.css";

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className={styles.deleteCell}>
      <button
        type="button"
        className={styles.deleteButton}
        disabled={pending}
        onClick={(e) => {
          e.stopPropagation();
          if (!confirm(`Delete "${productName}"? This can't be undone.`)) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteProduct(productId);
            if (result.ok) {
              router.push("/admin/inventory");
            } else {
              setError(result.error);
            }
          });
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <p className={styles.deleteError}>{error}</p>}
    </div>
  );
}
