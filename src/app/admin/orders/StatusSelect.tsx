"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import type { OrderStatus } from "@prisma/client";
import styles from "./page.module.css";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PAID", "FULFILLED", "CANCELLED"];

export default function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={styles.statusSelect}
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(() => {
          updateOrderStatus(orderId, next);
        });
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
