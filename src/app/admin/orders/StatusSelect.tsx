"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import type { OrderStatus } from "@prisma/client";
import styles from "./page.module.css";

// ponytail: the real-world flow only ever moves forward one step at a time
// (pending -> confirmed -> paid -> out for delivery -> fulfilled), so this
// only offers "mark as <next step>" instead of a free jump-anywhere dropdown.
// Cancelling is the one out-of-sequence move, kept as a separate action.
const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PAID", "OUT_FOR_DELIVERY", "FULFILLED"];

function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = FLOW.indexOf(status);
  return i === -1 || i === FLOW.length - 1 ? null : FLOW[i + 1];
}

export default function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const next = nextStatus(status);
  const canCancel = status !== "FULFILLED" && status !== "CANCELLED";

  return (
    <div className={styles.statusCell}>
      <span className={`${styles.statusBadge} ${styles[`status${status}`]}`}>{status.replace(/_/g, " ")}</span>
      {next && (
        <button
          type="button"
          className={styles.advanceButton}
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              updateOrderStatus(orderId, next);
            })
          }
        >
          Mark as {next.replace(/_/g, " ").toLowerCase()}
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
