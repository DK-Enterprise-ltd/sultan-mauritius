"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "@/app/actions/inventory";
import styles from "./page.module.css";

export default function StockAdjuster({ productId, quantity }: { productId: string; quantity: number }) {
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(sign: 1 | -1) {
    const n = Number(amount);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Enter a whole number > 0");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await adjustStock(productId, n * sign);
      if (!result.ok) setError(result.error);
      else setAmount("");
    });
  }

  return (
    <div className={styles.adjuster}>
      <span className={styles.qty}>{quantity}</span>
      <input
        type="number"
        min={1}
        step={1}
        value={amount}
        disabled={pending}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="qty"
        className={styles.qtyInput}
      />
      <button type="button" className={styles.adjustButton} disabled={pending} onClick={() => apply(-1)}>
        −
      </button>
      <button type="button" className={styles.adjustButton} disabled={pending} onClick={() => apply(1)}>
        +
      </button>
      {error && <span className={styles.adjustError}>{error}</span>}
    </div>
  );
}
