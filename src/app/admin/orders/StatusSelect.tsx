"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import type { OrderStatus } from "@prisma/client";
import styles from "./page.module.css";

// ponytail: only 3 real states, always moved forward one step at a time
// (pending -> confirmed -> fulfilled) plus the one out-of-sequence move,
// cancel. No online payment, so there's no separate "paid"/"out for
// delivery" step to track here.
const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "FULFILLED"];

function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = FLOW.indexOf(status);
  return i === -1 || i === FLOW.length - 1 ? null : FLOW[i + 1];
}

export default function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const [eta, setEta] = useState("");
  const next = nextStatus(status);
  const canCancel = status !== "FULFILLED" && status !== "CANCELLED";

  return (
    <div className={styles.statusCell}>
      <span className={`${styles.statusBadge} ${styles[`status${status}`]}`}>{status.replace(/_/g, " ")}</span>
      {next === "CONFIRMED" && (
        <input
          type="date"
          className={styles.etaInput}
          value={eta}
          onChange={(e) => setEta(e.target.value)}
          aria-label="Estimated delivery date"
        />
      )}
      {next && (
        <button
          type="button"
          className={styles.advanceButton}
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              updateOrderStatus(orderId, next, next === "CONFIRMED" && eta ? new Date(eta) : undefined);
            })
          }
        >
          Mark as {next.toLowerCase()}
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          className={styles.cancelButton}
          disabled={pending}
          onClick={() => {
            if (confirm(`Cancel order? This can't be undone.`)) {
              startTransition(() => {
                updateOrderStatus(orderId, "CANCELLED");
              });
            }
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
